import { add_activity, query_strategy } from '@/services/api';
import {
  ModalForm,
  ProFormDateTimePicker,
  ProFormGroup,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {App } from 'antd'; // 引入 App 组件
import React, {useEffect, useRef, useState} from 'react';
import {history} from "@@/core/history"; // 引入 useRef

interface AddFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
}

const AddForm: React.FC<AddFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish } = props;
  const { message } = App.useApp(); // 获取 message 实例
  const formRef = useRef<ProFormInstance>(); // 创建 formRef
  const [strategyList, setStrategyList] = useState<API.StrategyItem[]>([]);

  useEffect(() => {
    const fetchStrategyData = async () => {
      try {
        const strategyRes = await query_strategy();
        if (strategyRes && strategyRes.data) {
          setStrategyList(strategyRes.data);
        }
      } catch (error) {
        message.error('获取策略列表失败');
      }
    };

    if (visible) {
      fetchStrategyData();
    }
  }, [visible]);

  return (
    <ModalForm
      title="新建活动"
      visible={visible}
      formRef={formRef} // 绑定 formRef
      onVisibleChange={(v) => {
        if (!v) {
          formRef.current?.resetFields(); // 在关闭时重置表单
        }
        onVisibleChange(v);
      }}
      onFinish={async (values) => {
        const result = await add_activity(values);
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
        name="strategyId"
        label={
          <span>
            抽奖策略ID
          </span>
        }
        rules={[{ required: true, message: '请选择抽奖策略' }]}
        options={[
          ...strategyList.map((item) => ({
            label: `${item.strategyDesc}(${item.id})`,
            value: item.id,
          })),
          { label: '去新建+', value: '__NEW_STRATEGY__' },
        ]}
        showSearch
        fieldProps={{
          filterOption: (input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
          onChange: (value) => {
            if (value === '__NEW_STRATEGY__') {
              history.push('/strategy/strategy');
            }
          },
        }}
      />
      <ProFormText
        name="activityName"
        label="活动名称"
        rules={[{ required: true, message: '请输入活动名称' }]}
      />
      <ProFormTextArea
        name="activityDesc"
        label="活动描述"
        rules={[{ required: true, message: '请输入活动描述' }]}
      />
      <ProFormGroup>
        <ProFormDateTimePicker
          name="beginDateTime"
          label="开始时间"
          rules={[
            { required: true, message: '请选择开始时间' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const endDateTime = getFieldValue('endDateTime');
                // 确保 value 和 endDateTime 都是有效的日期对象，并转换为时间戳进行比较
                if (!value || !endDateTime) {
                  return Promise.resolve(); // 如果日期为空，则不进行比较，允许通过
                }

                const beginTimestamp =
                  value instanceof Date ? value.valueOf() : new Date(value).valueOf();
                const endTimestamp =
                  endDateTime instanceof Date
                    ? endDateTime.valueOf()
                    : new Date(endDateTime).valueOf();

                if (isNaN(beginTimestamp) || isNaN(endTimestamp)) {
                  return Promise.resolve(); // 如果日期无效，则不进行“开始时间必须小于结束时间”的检查
                } else if (beginTimestamp < endTimestamp) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('开始时间必须小于结束时间'));
              },
            }),
          ]}
          dependencies={['endDateTime']} // 添加依赖，当 endDateTime 改变时触发 beginDateTime 验证
        />
        <ProFormDateTimePicker
          name="endDateTime"
          label="结束时间"
          rules={[
            { required: true, message: '请选择结束时间' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const beginDateTime = getFieldValue('beginDateTime');
                // 确保 value 和 beginDateTime 都是有效的日期对象，并转换为时间戳进行比较
                if (!value || !beginDateTime) {
                  return Promise.resolve(); // 如果日期为空，则不进行比较，允许通过
                }

                const beginTimestamp =
                  beginDateTime instanceof Date
                    ? beginDateTime.valueOf()
                    : new Date(beginDateTime).valueOf();
                const endTimestamp =
                  value instanceof Date ? value.valueOf() : new Date(value).valueOf();

                if (isNaN(beginTimestamp) || isNaN(endTimestamp)) {
                  return Promise.resolve(); // 如果日期无效，则不进行“结束时间必须大于开始时间”的检查
                } else if (endTimestamp > beginTimestamp) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('结束时间必须大于开始时间'));
              },
            }),
          ]}
          dependencies={['beginDateTime']} // 添加依赖，当 beginDateTime 改变时触发 endDateTime 验证
        />
      </ProFormGroup>
      <ProFormSelect
        name="state"
        label="活动状态"
        rules={[{ required: true, message: '请选择活动状态' }]}
        options={[
          { label: '开启', value: 'open' },
          { label: '结束', value: 'close' },
        ]}
      />
    </ModalForm>
  );
};

export default AddForm;
