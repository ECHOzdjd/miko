import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Image, X, Send, Save, Globe, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { postsApi } from '../api/posts';
import toast from 'react-hot-toast';

interface PostForm {
  title: string;
  content: string;
  visibility: 'public' | 'private';
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    // setValue,
    formState: { errors },
  } = useForm<PostForm>({
    defaultValues: {
      visibility: 'public',
    },
  });

  const watchedVisibility = watch('visibility');
  const watchedContent = watch('content');

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('选择的文件数量:', files.length);
    console.log('当前图片数量:', images.length);
    
    if (files.length + images.length > 9) {
      toast.error('最多只能上传9张图片');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);
    console.log('更新后的图片数量:', newImages.length);

    // 生成预览
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log(`图片 ${index + 1} 预览生成:`, result ? '成功' : '失败');
        setImagePreviews(prev => {
          const newPreviews = [...prev, result];
          console.log('更新后的预览数量:', newPreviews.length);
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: PostForm, saveAsDraft = false) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    console.log('用户信息:', user);
    console.log('表单数据:', data);
    console.log('图片数量:', images.length);

    setIsSubmitting(true);
    setIsDraft(saveAsDraft);

    try {
      // 调用API发布帖子
      const postData = {
        title: data.title,
        content: data.content,
        post_type: 'text' as const,
        images: images,
      };

      console.log('发送的帖子数据:', postData);
      const newPost = await postsApi.createPost(postData);
      console.log('帖子创建成功:', newPost);
      
      if (saveAsDraft) {
        toast.success('草稿保存成功！');
      } else {
        toast.success('帖子发布成功！');
        navigate('/');
      }
    } catch (error: any) {
      console.error('发布帖子失败:', error);
      console.error('错误详情:', error.response?.data);
      console.error('完整错误对象:', error);
      if (error.response?.data?.images) {
        console.error('图片字段错误:', error.response.data.images);
      }
      if (error.response?.data?.uploaded_images) {
        console.error('上传图片字段错误:', error.response.data.uploaded_images);
      }
      toast.error(saveAsDraft ? '保存草稿失败' : '发布失败');
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data) => onSubmit(data, true))();
  };

  const getVisibilityIcon = () => {
    switch (watchedVisibility) {
      case 'public':
        return <Globe className="w-4 h-4" />;
      case 'private':
        return <Lock className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getVisibilityText = () => {
    switch (watchedVisibility) {
      case 'public':
        return '公开';
      case 'private':
        return '仅自己可见';
      default:
        return '公开';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b">
            <h1 className="text-xl font-semibold text-gray-900">发布新帖子</h1>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isDraft ? '保存中...' : '保存草稿'}
              </button>
              <button
                type="submit"
                form="post-form"
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting && !isDraft ? '发布中...' : '发布'}
              </button>
            </div>
          </div>

          <form id="post-form" onSubmit={handleSubmit((data) => onSubmit(data, false))}>
            <div className="p-6 space-y-6">
              {/* 标题 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  {...register('title', { required: '请输入标题' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="给你的帖子起个标题..."
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* 内容 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  {...register('content', { required: '请输入内容' })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="分享你的想法..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
                <div className="mt-2 text-right text-sm text-gray-500">
                  {watchedContent?.length || 0} / 2000
                </div>
              </div>

              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  图片 (最多9张) - 当前: {imagePreviews.length} 张
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => {
                    console.log(`渲染图片预览 ${index + 1}:`, preview ? '有数据' : '无数据');
                    return (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error(`图片 ${index + 1} 加载失败:`, e);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  {images.length < 9 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50"
                    >
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">添加图片</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* 发布设置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 可见性 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    可见性
                  </label>
                  <select
                    {...register('visibility')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="public">公开</option>
                    <option value="private">仅自己可见</option>
                  </select>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    {getVisibilityIcon()}
                    <span className="ml-1">{getVisibilityText()}</span>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
