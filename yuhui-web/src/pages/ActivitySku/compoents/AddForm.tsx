import { add_activity_sku, query_activity, query_activity_count } from '@/services/api';
import { ModalForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { history } from '@umijs/max';

interface AddFormProps {
  visible: boolean;
  initialValues?: Partial<API.ActivitySkuItem>;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
}

const AddForm: React.FC<AddFormProps> = (props) => {
  const { visible, initialValues, onVisibleChange, onFinish } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const [activityList, setActivityList] = useState<API.ActivityItem[]>([]);
  const [activityCountList, setActivityCountList] = useState<API.ActivityCountItem[]>([]);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const activityRes = await query_activity();
        if (activityRes && activityRes.data) {
          setActivityList(activityRes.data);
        }
      } catch (error) {
        message.error('获取活动列表失败');
      }
    };

    const fetchActivityCountData = async () => {
      try {
        const activityCountRes = await query_activity_count();
        if (activityCountRes && activityCountRes.data) {
          setActivityCountList(activityCountRes.data);
        }
      } catch (error) {
        message.error('获取活动次数配置列表失败');
      }
    };

    if (visible) {
      formRef.current?.setFieldsValue(initialValues || {});
      fetchActivityData();
      fetchActivityCountData();
    }
  }, [visible, initialValues]);

  return (
    <ModalForm
      title="新建活动sku配置"
      visible={visible}
      formRef={formRef}
      initialValues={initialValues}
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields();
        }
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        const result = await add_activity_sku(values);
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
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_ACTIVITY__') {
              history.push('/admin/activity');
              formRef.current?.setFieldsValue({ activityCountId: undefined });
            }
          },
        }}
      />

      <ProFormSelect
        name="activityCountId"
        label="count_id"
        rules={[{ required: true, message: '请选择count_id' }]}
        options={[
          ...activityCountList.map((item) => ({
            label: `${item.id} (${item.totalCount}次/总, ${item.dayCount}次/日, ${item.monthCount}次/月)`,
            value: item.id,
          })),
          { label: '去新建+', value: '__NEW_ACTIVITY_COUNT__' }, // 添加新建选项
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_ACTIVITY_COUNT__') {
              history.push('/rebate/activity_count');
              formRef.current?.setFieldsValue({ activityCountId: undefined });
            }
          },
        }}
      />

      <ProFormText
        name="stockCount"
        label="总库存"
        rules={[{ required: true, message: '请输入总库存' }]}
      />
      <ProFormText
        name="stockCountSurplus"
        label="剩余库存"
        rules={[{ required: true, message: '请输入剩余库存' }]}
      />
      <ProFormText
        name="productAmount"
        label="兑换所需积分"
        tooltip={'精确到小数点后两位，如0.99'}
        rules={[{ required: true, message: '请输入兑换所需积分' }]}
      />
    </ModalForm>
  );
};

export default AddForm;
