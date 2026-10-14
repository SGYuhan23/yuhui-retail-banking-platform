import { update_rule } from '@/services/api';
import { ProFormTextArea } from '@ant-design/pro-components'; // 引入 useRef 和 useEffect
import { ModalForm, ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useRef } from 'react';

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
      title="修改策略规则"
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
        const result = await update_rule(values);
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
        label="策略规则ID"
        disabled // ID通常不可修改
      />
      <ProFormText
        name="ruleModel"
        label="规则模型(唯一)"
        tooltip="必须包含rule_weight字段或rule_blacklist字段"
        rules={[
          { required: true, message: '请输入规则模型' },
          {
            validator: (_, value) => {
              if (value && value.includes('rule_weight')|| value.includes('rule_blacklist')) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('输入内容必须包含 rule_weight 或 rule_blacklist'));
            },
          },
        ]}
      />
      <ProFormText
        name="ruleValue"
        label="规则值"
        rules={[{ required: true, message: '请输入规则值' }]}
      />
      <ProFormTextArea
        name="ruleDesc"
        label="规则描述"
        rules={[{ required: true, message: '请输入规则描述' }]}
      />
    </ModalForm>
  );
};

export default UpdateForm;
