import { add_behavior_rebate, query_activity, query_activity_sku } from '@/services/api';
import { ProFormTextArea } from '@ant-design/pro-components';
import {
  ModalForm,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { history } from '@umijs/max';

interface AddFormProps {
  visible: boolean;
  initialValues?: Partial<API.BehaviorRebateItem>;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
}

const AddForm: React.FC<AddFormProps> = (props) => {
  const { visible, initialValues, onVisibleChange, onFinish } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const [activityList, setActivityList] = useState<API.ActivityItem[]>([]);
  const [activitySkuList, setActivitySkuList] = useState<API.ActivitySkuItem[]>([]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const activityRes = await query_activity();
        if (activityRes?.data) {
          setActivityList(activityRes.data);
        }
      } catch (error) {
        message.error('获取活动列表失败');
      }
    };

    const fetchActivitySkuData = async () => {
      try {
        const activitySkuRes = await query_activity_sku();
        if (activitySkuRes?.data) {
          setActivitySkuList(activitySkuRes.data);
        }
      } catch (error) {
        message.error('获取活动 SKU 配置列表失败');
      }
    };

    if (visible) {
      fetchActivityData();
      fetchActivitySkuData();
    }
  }, [message, visible]);

  useEffect(() => {
    if (visible) {
      formRef.current?.setFieldsValue(initialValues || {});
    }
  }, [initialValues, visible]);

  return (
    <ModalForm
      title="新建返利配置"
      visible={visible}
      formRef={formRef}
      initialValues={initialValues}
      onVisibleChange={(nextVisible) => {
        if (!nextVisible) {
          formRef.current?.resetFields();
        }
        onVisibleChange(nextVisible);
      }}
      onFinish={async (values) => {
        const result = await add_behavior_rebate(values);
        if (result.code === 1000) {
          message.success('添加成功');
          onFinish?.();
          return true;
        }
        message.error(result.message);
        return false;
      }}
    >
      <ProFormSelect
        name="activityId"
        label="活动ID"
        rules={[{ required: true, message: '请选择活动ID' }]}
        options={[
          ...activityList.map((item) => ({
            label: `${item.id} (${item.activityName})`,
            value: item.id,
          })),
          { label: '去新建+', value: '__NEW_ACTIVITY__' },
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_ACTIVITY__') {
              history.push('/admin/activity');
              formRef.current?.setFieldsValue({ activityId: undefined });
            }
          },
        }}
      />

      <ProFormSelect
        name="behaviorType"
        label="行为类型"
        rules={[{ required: true, message: '请选择行为类型' }]}
        options={[
          { label: '签到', value: 'sign' },
          { label: '支付', value: 'openai_pay' },
          { label: '活动赠送', value: 'activity_gift' },
        ]}
      />

      <ProFormTextArea
        name="rebateDesc"
        label="返利描述"
        rules={[{ required: true, message: '请输入返利描述' }]}
      />

      <ProFormSelect
        name="rebateType"
        label="返利类型"
        rules={[{ required: true, message: '请选择返利类型' }]}
        options={[
          { label: '抽奖次数-兑换/签到', value: 'sku' },
          { label: '积分-签到', value: 'integral' },
          { label: '抽奖次数-活动赠送', value: 'gift' },
        ]}
        fieldProps={{
          onChange: () => {
            formRef.current?.setFieldsValue({ rebateConfig: undefined });
          },
        }}
      />

      <ProFormDependency name={['rebateType']}>
        {({ rebateType }) => {
          if (rebateType === 'sku') {
            return (
              <ProFormSelect
                name="rebateConfig"
                label="返利配置"
                rules={[{ required: true, message: '请选择返利配置' }]}
                options={[
                  ...activitySkuList.map((item) => ({
                    label: `${item.id}`,
                    value: item.id,
                  })),
                  { label: '去新建+', value: '__NEW_ACTIVITY_SKU__' },
                ]}
                showSearch
                fieldProps={{
                  filterOption: (input, option) =>
                    String(option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase()),
                  onChange: (value) => {
                    if (value === '__NEW_ACTIVITY_SKU__') {
                      history.push('/rebate/activity_sku');
                      formRef.current?.setFieldsValue({ rebateConfig: undefined });
                    }
                  },
                }}
              />
            );
          }

          if (rebateType === 'integral' || rebateType === 'gift') {
            return (
              <ProFormText
                name="rebateConfig"
                label="返利配置"
                rules={[{ required: true, message: '请输入返利配置' }]}
              />
            );
          }

          return (
            <ProFormText
              name="rebateConfig"
              label="返利配置"
              disabled
              placeholder="请先选择返利类型"
            />
          );
        }}
      </ProFormDependency>

      <ProFormSelect
        name="state"
        label="状态"
        rules={[{ required: true, message: '请选择状态' }]}
        options={[
          { label: '开启', value: 'open' },
          { label: '关闭', value: 'close' },
        ]}
      />
    </ModalForm>
  );
};

export default AddForm;
