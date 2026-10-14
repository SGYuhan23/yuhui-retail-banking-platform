import { query_rule_tree, update_rule_tree_node } from '@/services/api';
import { history } from '@@/core/history';
import { ModalForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

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
  const [ruleTreeList, setRuleTreeList] = useState<API.RuleTreeItem[]>([]);

  useEffect(() => {
    const fetchRuleTreeData = async () => {
      try {
        const ruleTreeRes = await query_rule_tree();
        if (ruleTreeRes && ruleTreeRes.data) {
          setRuleTreeList(ruleTreeRes.data);
        }
      } catch (error) {
        message.error('获取奖品规则树列表失败');
      }
    };

    if (visible) {
      fetchRuleTreeData();
    }
  }, [visible]);
  return (
    <ModalForm
      title="修改奖品规则节点"
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
        const result = await update_rule_tree_node(values);
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
        label="奖品规则节点ID"
        disabled // ID通常不可修改
      />
      <ProFormSelect
        disabled
        name="ruleTreeId"
        label="奖品规则树ID"
        rules={[{ required: true, message: '请选择奖品规则树ID' }]}
        options={[
          ...ruleTreeList.map((item) => ({
            label: `${item.id} (${item.treeName})`,
            value: item.id,
          })),
          { label: '去新建+', value: '__NEW_RULE_TREE__' }, // 添加新建选项
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_RULE_TREE__') {
              history.push('/strategy/tree');
            }
          },
        }}
      />
      <ProFormSelect
        name="ruleName"
        label="奖品规则节点类型"
        rules={[{ required: true, message: '请选择奖品规则树节点类型' }]}
        options={[
          { label: 'rule_lock(次数锁)', value: 'rule_lock' },
          { label: 'rule_stock(库存)', value: 'rule_stock' },
          { label: 'rule_luck_award(兜底)', value: 'rule_luck_award' },
        ]}
        showSearch
      />
      <ProFormText
        name="ruleDesc"
        label="规则描述"
        rules={[{ required: true, message: '请输入规则描述' }]}
      />
      <ProFormText
        name="ruleValue"
        label="规则值"
      />
    </ModalForm>
  );
};

export default UpdateForm;
