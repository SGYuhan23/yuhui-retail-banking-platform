import { add_activity_count } from '@/services/api';
import { ModalForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd'; // 引入 App 组件
import React, { useRef } from 'react'; // 引入 useRef

interface AddFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
}

const AddForm: React.FC<AddFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish } = props;
  const { message } = App.useApp(); // 获取 message 实例
  const formRef = useRef<ProFormInstance>(); // 创建 formRef

  return (
    <ModalForm
      title="新建活动次数配置"
      visible={visible}
      formRef={formRef} // 绑定 formRef
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields(); // 在关闭时重置表单
        }
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        const result = await add_activity_count(values);
        if (result.code === 1000) {
          message.success('添加成功');
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

export default AddForm;
