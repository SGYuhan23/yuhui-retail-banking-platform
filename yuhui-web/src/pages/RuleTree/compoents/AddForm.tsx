import { add_rule_tree } from '@/services/api';
import { } from '@ant-design/pro-components'; // 引入 useRef
import {ModalForm, ProFormInstance, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { App } from 'antd'; // 引入 App 组件
import React, { useRef } from 'react';
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
      title="新建策略规则"
      visible={visible}
      formRef={formRef} // 绑定 formRef
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields(); // 在关闭时重置表单
        }
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        const result = await add_rule_tree(values);
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

export default AddForm;
