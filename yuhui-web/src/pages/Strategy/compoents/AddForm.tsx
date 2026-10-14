import { add_strategy, query_rule } from '@/services/api';
import { history } from '@@/core/history';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ProFormTextArea } from '@ant-design/pro-components'; // 引入 useRef
import { ModalForm, ProFormInstance, ProFormSelect } from '@ant-design/pro-components';
import { App, Tooltip } from 'antd'; // 引入 App 组件
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
  const [ruleList, setRuleList] = useState<API.RuleItem[]>([]);

  useEffect(() => {
    const fetchRuleData = async () => {
      try {
        const ruleRes = await query_rule();
        if (ruleRes && ruleRes.data) {
          setRuleList(ruleRes.data);
        }
      } catch (error) {
        message.error('获取策略规则列表失败');
      }
    };

    if (visible) {
      fetchRuleData();
    }
  }, [visible]);

  return (
    <ModalForm
      title="新建策略"
      visible={visible}
      formRef={formRef} // 绑定 formRef
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields(); // 在关闭时重置表单
        }
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        // 将 ruleModels 数组转换为逗号分隔的字符串
        if (Array.isArray(values.ruleModels)) {
          values.ruleModels = values.ruleModels.join(',');
        }
        const result = await add_strategy(values);
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
      <ProFormTextArea
        name="strategyDesc"
        label="策略描述"
        rules={[{ required: true, message: '请输入策略描述' }]}
      />
      <ProFormSelect
        name="ruleModels"
        label={
          <span>
            规则模型{' '}
            <Tooltip title="将按所选顺序依次进行校验">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        // rules={[{ required: true, message: '请选择规则模型' }]}
        mode="multiple" // 添加 mode="multiple" 属性
        options={[
          ...ruleList.map((item) => ({
            label: `${item.ruleModel}`,
            value: item.ruleModel,
          })),
          { label: '去新建+', value: '__NEW_RULE__' },
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value: string[]) => {
            // value 在多选模式下是字符串数组
            if (value.includes('__NEW_RULE__')) {
              history.push('/strategy/rule');
              // 导航后，将 '__NEW_RULE__' 从当前选中值中移除，避免其作为实际选项被提交
              formRef.current?.setFieldsValue({
                ruleModels: value.filter((item) => item !== '__NEW_RULE__'),
              });
            }
          },
        }}
      />
    </ModalForm>
  );
};

export default AddForm;
