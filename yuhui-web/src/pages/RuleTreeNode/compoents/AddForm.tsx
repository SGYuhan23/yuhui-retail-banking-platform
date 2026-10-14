import { add_rule_tree_node, query_rule_tree } from '@/services/api';
import { history } from '@@/core/history';
import { ModalForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd'; // 引入 App 组件
import React, { useEffect, useRef, useState } from 'react';

interface AddFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
}

const AddForm: React.FC<AddFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish } = props;
  const { message } = App.useApp(); // 获取 message 实例
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
      title="新建奖品规则节点"
      visible={visible}
      formRef={formRef} // 绑定 formRef
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields(); // 在关闭时重置表单
        }
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        const result = await add_rule_tree_node(values);
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
      <ProFormSelect
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
      <ProFormText name="ruleValue" label="规则值" />
    </ModalForm>
  );
};

export default AddForm;
