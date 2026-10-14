import {query_activity, query_activity_count, update_activity_sku} from '@/services/api';
import {ModalForm, ProFormInstance, ProFormSelect, ProFormText} from '@ant-design/pro-components';
import { App } from 'antd';
import React, {useEffect, useRef, useState} from 'react';
import {history} from "@@/core/history"; // 引入 useRef 和 useEffect

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
      fetchActivityData();
      fetchActivityCountData();
    }
  }, [visible]);

  return (
    <ModalForm
      title="修改活动sku配置"
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
        const result = await update_activity_sku(values);
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
        label="sku_ID"
        disabled // ID通常不可修改
      />
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
            label: `${item.id} (${item.totalCount}/总, ${item.dayCount}/日, ${item.monthCount}/月)`,
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

export default UpdateForm;
