from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password, ValidationError as DjangoValidationError
from .models import User, UserProfile, UserFollow, UserBlock


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'nickname', 'password', 'password_confirm')

    def validate_password(self, value):
        """自定义密码验证，提供详细的错误信息"""
        try:
            # 传递用户信息给密码验证器，以便进行相似性检查
            user_data = self.initial_data
            user = User(email=user_data.get('email', ''), nickname=user_data.get('nickname', ''))
            validate_password(value, user)
        except DjangoValidationError as e:
            # 将Django的验证错误转换为更友好的中文提示
            error_messages = []
            for error in e.messages:
                error_lower = error.lower()
                if 'too common' in error_lower or 'common password' in error_lower or '太常见' in error:
                    error_messages.append('密码过于常见，请选择更复杂的密码。建议使用字母、数字和特殊字符的组合。')
                elif 'too short' in error_lower or '太短' in error:
                    error_messages.append('密码至少需要6个字符')
                elif 'entirely numeric' in error_lower or '只包含数字' in error or 'numeric' in error_lower:
                    error_messages.append('密码不能全部为数字，请添加字母或特殊字符')
                elif 'similar' in error_lower or 'too similar' in error_lower or '相似' in error:
                    error_messages.append('密码不能与邮箱或昵称过于相似，请选择不同的密码')
                else:
                    # 对于其他未匹配的错误，也进行中文化处理
                    if 'password' in error_lower and 'common' in error_lower:
                        error_messages.append('密码过于常见，请选择更复杂的密码。建议使用字母、数字和特殊字符的组合。')
                    else:
                        error_messages.append('密码不符合安全要求，请选择更强的密码')
            
            raise serializers.ValidationError(error_messages)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "两次输入的密码不一致"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # 创建用户资料
        UserProfile.objects.create(user=user)
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('邮箱或密码错误')
            if not user.is_active:
                raise serializers.ValidationError('账户已被禁用')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('必须提供邮箱和密码')
        return attrs


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    background_url = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_followed_by = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'nickname', 'avatar_url', 'background_url',
            'signature', 'bio', 'birthday', 'gender', 'location',
            'followers_count', 'following_count', 'posts_count', 'likes_received', 
            'last_active', 'created_at', 'is_following', 'is_followed_by'
        )
        read_only_fields = (
            'id', 'email', 'followers_count', 'following_count',
            'posts_count', 'likes_received', 'last_active', 'created_at'
        )

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar:
            try:
                # 检查文件是否存在
                if obj.avatar and hasattr(obj.avatar, 'url') and obj.avatar.url:
                    if request:
                        return request.build_absolute_uri(obj.avatar.url)
                    return obj.avatar.url
            except (ValueError, AttributeError):
                # 如果头像文件不存在或有问题，使用默认头像
                pass
        
        # 当没有头像或头像文件不存在时，返回Gravatar URL
        import hashlib
        email_hash = hashlib.md5(obj.email.lower().encode()).hexdigest()
        return f'https://www.gravatar.com/avatar/{email_hash}?d=identicon&s=200'

    def get_background_url(self, obj):
        request = self.context.get('request')
        if obj.background_image:
            if request:
                return request.build_absolute_uri(obj.background_image.url)
            return obj.background_image.url
        # 当没有背景图时，返回默认背景图
        if request:
            return request.build_absolute_uri('/static/images/default-background.jpg')
        return '/static/images/default-background.jpg'

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFollow.objects.filter(
                follower=request.user, following=obj
            ).exists()
        return False

    def get_is_followed_by(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserFollow.objects.filter(
                follower=obj, following=request.user
            ).exists()
        return False


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class UserFollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = UserFollow
        fields = '__all__'


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'nickname', 'signature', 'bio', 'birthday', 'gender',
            'location', 'avatar'
        )

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError('昵称已存在')
        return value
