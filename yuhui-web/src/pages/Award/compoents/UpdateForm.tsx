import { update_award, upload} from '@/services/api';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { ProFormTextArea } from '@ant-design/pro-components';
import { ModalForm, ProFormInstance, ProFormItem, ProFormText } from '@ant-design/pro-components';
import { App, message, Upload } from 'antd';
import React, { useEffect, useRef } from 'react';

interface UpdateFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
  initialValues: API.ActivityCountItem; // 接收初始值
}

// 添加图片上传组件
const ImageUploader: React.FC<any> = ({ value, onChange }) => {
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string>(value);

  // 当 value 变化时更新 imageUrl，以支持表单的 initialValues 或 resetFields
  useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await upload(formData);
      console.log(res);
      if (res.code === 1000 && res.message) {
        setImageUrl(res.message);
        onChange?.(res.message);
        message.success('上传成功');
      } else {
        message.error(res.message);
      }
    } catch (error: any) {
      message.error('上传失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      name="file"
      listType="picture-card"
      showUploadList={false}
      accept="image/*"
      beforeUpload={(file) => {
        // 验证文件类型
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('只能上传图片文件！');
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          message.error('图片大小不能超过 5MB');
          return false;
        }
        handleUpload(file);
        return false;
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="商品图片"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
  );
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish, initialValues } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>(); // 创建 formRef

  return (
    <ModalForm
      title="修改奖品配置"
      visible={visible}
      formRef={formRef}
      key={initialValues.id} // 添加 key 属性，使用 initialValues.id
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields(); // 在关闭时重置表单
        }
        onVisibleChange(v);
      }}
      initialValues={initialValues}
      onFinish={async (values) => {
        const result = await update_award(values);
        if (result.code === 1000) {
          message.success('修改成功');
          if (onFinish) {
            onFinish();
          }
          return true;
        }
        message.error(result.message);
        return false;
      }}
    >
      <ProFormText
        name="id"
        label="奖品ID"
        disabled // ID通常不可修改
      />
      <ProFormText
        name="awardKey"
        label="唯一标识"
        tooltip={'要与服务端已有发奖服务唯一标识对应'}
        rules={[{ required: true, message: '请输入总库存' }]}
      />
      <ProFormTextArea
        name="awardConfig"
        label="奖品配置"
        rules={[{ required: true, message: '请输入剩余库存' }]}
      />
      <ProFormTextArea
        name="awardDesc"
        label="奖品内容描述"
        rules={[{ required: true, message: '请输入兑换所需积分' }]}
      />
      {/* 将 ImageUploader 包裹在 ProFormItem 中 */}
      <ProFormItem
        name="image"
        label="奖品图片"
        rules={[{ required: true, message: '请上传奖品图片' }]}
      >
        <ImageUploader />
      </ProFormItem>
    </ModalForm>
  );
};

export default UpdateForm;
