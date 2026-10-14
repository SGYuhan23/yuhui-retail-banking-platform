import { update_rule_tree } from '@/services/api';
import { } from '@ant-design/pro-components'; // 引入 useRef 和 useEffect
import {ModalForm, ProFormInstance, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useRef } from 'react';

interface UpdateFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
  initialValues: API.RuleTreeItem; // 接收初始值
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
        const result = await update_rule_tree(values);
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
        label="奖品规则ID"
        disabled // ID通常不可修改
      />
      <ProFormText
        name="treeName"
        label="奖品规则树名称"
        rules={[{ required: true, message: '请输入奖品规则树名称' }]}
      />
      <ProFormText
        name="treeDesc"
        label="奖品规则树描述"
        rules={[{ required: true, message: '请输入奖品规则树描述' }]}
      />
      <ProFormSelect
        name="treeNodeRuleKey"
        label="入口规则"
        rules={[{ required: true, message: '请选择入口规则' }]}
        options={[
          { label: 'rule_lock', value: 'rule_lock' },
          { label: 'rule_stock', value: 'rule_stock' },
        ]}
        showSearch
      />
    </ModalForm>
  );
};

export default UpdateForm;
