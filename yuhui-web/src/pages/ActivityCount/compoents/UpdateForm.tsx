import { update_activity_count } from '@/services/api';
import { ModalForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useRef } from 'react'; // 引入 useRef 和 useEffect

interface UpdateFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
  initialValues: API.ActivityCountItem; // 接收初始值
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish, initialValues } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>(); // 创建 formRef

  return (
    <ModalForm
      title="修改活动次数配置"
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
        const result = await update_activity_count(values);
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
        label="count_ID"
        disabled // ID通常不可修改
      />
      <ProFormText
        name="totalCount"
        label="总次数"
        rules={[{ required: true, message: '请输入总次数' }]}
      />
      <ProFormText
        name="monthCount"
        label="月次数"
        rules={[{ required: true, message: '请输入月次数' }]}
      />
      <ProFormText
        name="dayCount"
        label="日次数"
        rules={[{ required: true, message: '请输入日次数' }]}
      />
    </ModalForm>
  );
};

export default UpdateForm;
