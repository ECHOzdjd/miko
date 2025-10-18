from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from imagekit.models import ProcessedImageField
from imagekit.processors import ResizeToFill


class UserManager(BaseUserManager):
    """自定义用户管理器"""
    def create_user(self, email, nickname, password=None, **extra_fields):
        if not email:
            raise ValueError('用户必须有邮箱地址')
        if not nickname:
            raise ValueError('用户必须有昵称')
        
        email = self.normalize_email(email)
        user = self.model(email=email, nickname=nickname, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, nickname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('超级用户必须设置 is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('超级用户必须设置 is_superuser=True')
        
        return self.create_user(email, nickname, password, **extra_fields)


class User(AbstractUser):
    """自定义用户模型"""
    username = None  # 不使用用户名
    email = models.EmailField(unique=True, verbose_name='邮箱')
    phone = models.CharField(max_length=11, blank=True, null=True, verbose_name='手机号')
    nickname = models.CharField(max_length=50, unique=True, verbose_name='昵称')
    avatar = ProcessedImageField(
        upload_to='avatars/',
        processors=[ResizeToFill(200, 200)],
        format='JPEG',
        options={'quality': 90},
        blank=True,
        null=True,
        verbose_name='头像'
    )
    background_image = ProcessedImageField(
        upload_to='backgrounds/',
        processors=[ResizeToFill(1200, 400)],
        format='JPEG',
        options={'quality': 85},
        blank=True,
        null=True,
        verbose_name='背景图'
    )
    signature = models.TextField(max_length=200, blank=True, verbose_name='个人签名')
    bio = models.TextField(max_length=500, blank=True, verbose_name='个人简介')
    birthday = models.DateField(blank=True, null=True, verbose_name='生日')
    gender = models.CharField(
        max_length=10,
        choices=[('male', '男'), ('female', '女'), ('other', '其他')],
        blank=True,
        verbose_name='性别'
    )
    location = models.CharField(max_length=100, blank=True, verbose_name='所在地')
    followers_count = models.PositiveIntegerField(default=0, verbose_name='粉丝数')
    following_count = models.PositiveIntegerField(default=0, verbose_name='关注数')
    posts_count = models.PositiveIntegerField(default=0, verbose_name='帖子数')
    likes_received = models.PositiveIntegerField(default=0, verbose_name='获赞数')
    last_active = models.DateTimeField(default=timezone.now, verbose_name='最后活跃时间')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')

    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nickname']

    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'

    def __str__(self):
        return self.nickname

    @property
    def full_name(self):
        return f"{self.nickname}"

    def get_avatar_url(self):
        if self.avatar:
            return self.avatar.url
        # 返回一个基于用户ID的默认头像URL，使用Gravatar或类似的服务
        import hashlib
        email_hash = hashlib.md5(self.email.lower().encode()).hexdigest()
        return f'https://www.gravatar.com/avatar/{email_hash}?d=identicon&s=200'

    def get_background_url(self):
        if self.background_image:
            return self.background_image.url
        return '/static/images/default-background.jpg'


class UserProfile(models.Model):
    """用户扩展资料"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    interests = models.JSONField(default=list, verbose_name='兴趣爱好')
    favorite_anime = models.JSONField(default=list, verbose_name='喜欢的动漫')
    favorite_manga = models.JSONField(default=list, verbose_name='喜欢的漫画')
    favorite_games = models.JSONField(default=list, verbose_name='喜欢的游戏')
    social_links = models.JSONField(default=dict, verbose_name='社交链接')
    privacy_settings = models.JSONField(default=dict, verbose_name='隐私设置')
    notification_settings = models.JSONField(default=dict, verbose_name='通知设置')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = '用户资料'
        verbose_name_plural = '用户资料'

    def __str__(self):
        return f"{self.user.nickname}的资料"


class UserFollow(models.Model):
    """用户关注关系"""
    follower = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='following_relations',
        verbose_name='关注者'
    )
    following = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='follower_relations',
        verbose_name='被关注者'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='关注时间')

    class Meta:
        db_table = 'user_follows'
        verbose_name = '用户关注'
        verbose_name_plural = '用户关注'
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.nickname} 关注 {self.following.nickname}"


class UserBlock(models.Model):
    """用户屏蔽关系"""
    blocker = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='blocking_relations',
        verbose_name='屏蔽者'
    )
    blocked = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='blocked_relations',
        verbose_name='被屏蔽者'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='屏蔽时间')

    class Meta:
        db_table = 'user_blocks'
        verbose_name = '用户屏蔽'
        verbose_name_plural = '用户屏蔽'
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.nickname} 屏蔽 {self.blocked.nickname}"
