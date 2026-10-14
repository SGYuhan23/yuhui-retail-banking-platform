import { query_rule, update_strategy } from '@/services/api';
import { history } from '@@/core/history';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ProFormTextArea } from '@ant-design/pro-components';
import { ModalForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { App, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface UpdateFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
  initialValues: API.StrategyItem;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish, initialValues } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();
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
      // 在 visible 变为 true 时，设置表单值
      if (initialValues && formRef.current) {
        const newInitialValues = { ...initialValues };
        if (typeof newInitialValues.ruleModels === 'string') {
          // 将字符串类型的ruleModels转换为字符串数组
          newInitialValues.ruleModels = newInitialValues.ruleModels.split(',') as unknown as string;
        }
        formRef.current.setFieldsValue(newInitialValues);
      }
    }
  }, [visible, initialValues, formRef]);

  return (
    <ModalForm
      title="修改策略"
      visible={visible}
      formRef={formRef}
      onVisibleChange={(v) => {
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        // 将 ruleModels 数组转换为逗号分隔的字符串
        if (Array.isArray(values.ruleModels)) {
          values.ruleModels = values.ruleModels.join(',');
        }
        const result = await update_strategy(values);
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
      <ProFormText name="id" label="策略ID" disabled />
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
        rules={[{ required: true, message: '请选择规则模型' }]}
        mode="multiple"
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
            if (value.includes('__NEW_RULE__')) {
              history.push('/strategy/rule');
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

export default UpdateForm;
