import {query_rule_tree, query_rule_tree_node_one, update_rule_tree_node_line} from '@/services/api';
import { history } from '@@/core/history';
import { ModalForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface UpdateFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
  initialValues: API.RuleTreeNodeItem; // 接收初始值
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish, initialValues } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>(); // 创建 formRef
  const [ruleTreeList, setRuleTreeList] = useState<API.RuleTreeItem[]>([]);
  const [ruleTreeNodeList, SetRuleTreeNodeList] = useState<API.RuleTreeNodeItem[]>([]);
  const [selectedRuleTreeId, setSelectedRuleTreeId] = useState<string>();

  // 获取规则树节点列表
  const fetchRuleTreeNodeData = async (ruleTreeId: string) => {
    try {
      const ruleTreeLineRes = await query_rule_tree_node_one(ruleTreeId);
      if (ruleTreeLineRes && ruleTreeLineRes.data) {
        SetRuleTreeNodeList(ruleTreeLineRes.data);
      }
    } catch (error) {
      message.error('获取奖品规则树节点列表失败');
    }
  };
  const fetchRuleTreeData = async () => {
    try {
      const ruleTreeRes = await query_rule_tree();
      if (ruleTreeRes && ruleTreeRes.data) {
        setRuleTreeList(ruleTreeRes.data);
        setSelectedRuleTreeId(initialValues.ruleTreeId)
      }
    } catch (error) {
      message.error('获取奖品规则树配置列表失败');
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRuleTreeData();
    }
  }, [visible]);
  useEffect(() => {
    fetchRuleTreeNodeData(selectedRuleTreeId as string)
  }, [selectedRuleTreeId]);

  return (
    <ModalForm
      title="修改奖品规则节点连接"
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
        const result = await update_rule_tree_node_line(values);
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
        label="规则节点连线ID"
        disabled // ID通常不可修改
      />
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
            }else {
              // setSelectedRuleTreeId(value as string);
              // 清空 ruleNodeFrom 和 ruleNodeTo 的值
              formRef.current?.setFieldsValue({
                ruleNodeFrom: undefined,
                ruleNodeTo: undefined
              });
              fetchRuleTreeNodeData(value as string);
            }
          },
        }}
      />
      <ProFormSelect
        name="ruleNodeFrom"
        label="从"
        rules={[{ required: true, message: '请选择起始节点' }]}
        options={[
          ...ruleTreeNodeList.map((item) => ({
            label: `${item.ruleName}`,
            value: item.ruleName,
          })),
          { label: '去新建+', value: '__NEW_RULE_TREE_NODE__' }, // 添加新建选项
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_RULE_TREE_NODE__') {
              history.push('/strategy/node');
            }
          },
        }}
      />
      <ProFormSelect
        name="ruleLimitValue"
        label="限定值"
        rules={[{ required: true, message: '请选择限定值' }]}
        options={[
          { label: 'ALLOW', value: 'ALLOW' },
          { label: 'TAKE_OVER', value: 'TAKE_OVER' },
        ]}
        showSearch
      />
      <ProFormSelect
        name="ruleNodeTo"
        label="到"
        rules={[{ required: true, message: '请选择结束节点' }]}
        options={[
          ...ruleTreeNodeList.map((item) => ({
            label: `${item.ruleName}`,
            value: item.ruleName,
          })),
          { label: '去新建+', value: '__NEW_RULE_TREE_NODE__' }, // 添加新建选项
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_RULE_TREE_NODE__') {
              history.push('/strategy/node');
            }
          },
        }}
      />
      <ProFormSelect
        name="ruleLimitType"
        label="限定类型"
        rules={[{ required: true, message: '请选择限定类型' }]}
        options={[
          { label: 'EQUAL', value: 'EQUAL' },
          { label: 'GT', value: 'GT' },
          { label: 'LT', value: 'LT' },
          { label: 'GTE', value: 'GTE' },
          { label: 'LTE', value: 'LTE' },
        ]}
        showSearch
      />

    </ModalForm>
  );
};

export default UpdateForm;
