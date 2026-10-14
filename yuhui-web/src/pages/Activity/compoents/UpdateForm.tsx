import { ModalForm, ProFormText, ProFormTextArea, ProFormDateTimePicker, ProFormSelect, ProFormGroup, ProFormInstance } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useRef, useEffect } from 'react'; // 引入 useRef 和 useEffect
import { update_activity } from '@/services/api';

interface UpdateFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish?: () => void;
  initialValues: API.ActivityItem; // 接收初始值
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { visible, onVisibleChange, onFinish, initialValues } = props;
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>(); // 创建 formRef

  // 使用 useEffect 监听 initialValues 或 visible 的变化，并设置表单值
  useEffect(() => {
    if (visible && initialValues) {
      // 将日期字符串转换为 Date 对象
      const formattedValues = {
        ...initialValues,
        beginDateTime: initialValues.beginDateTime ? new Date(initialValues.beginDateTime) : undefined,
        endDateTime: initialValues.endDateTime ? new Date(initialValues.endDateTime) : undefined,
      };
      formRef.current?.setFieldsValue(formattedValues);
    }
  }, [visible, initialValues]);

  return (
    <ModalForm
      title="修改活动"
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
        const result = await update_activity(values);
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
        label="活动ID"
        rules={[{ required: true, message: '请输入活动ID' }]}
        disabled // 活动ID通常不可修改
      />
      <ProFormText
        name="strategyId"
        label="抽奖策略ID"
        rules={[{ required: true, message: '请输入抽奖策略ID' }]}
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
            ({
              getFieldValue
            }) => ({
              validator(_, value) {
                const endDateTime = getFieldValue('endDateTime');
                // 确保 value 和 endDateTime 都是有效的日期对象，并转换为时间戳进行比较
                if (
                  !value ||
                  !endDateTime
                ) {
                  return Promise.resolve(); // 如果日期为空，则不进行比较，允许通过
                }

                const beginTimestamp = value instanceof Date ? value.valueOf() : new Date(value).valueOf();
                const endTimestamp = endDateTime instanceof Date ? endDateTime.valueOf() : new Date(endDateTime).valueOf();

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
            ({
              getFieldValue
            }) => ({
              validator(_, value) {
                const beginDateTime = getFieldValue('beginDateTime');
                // 确保 value 和 beginDateTime 都是有效的日期对象，并转换为时间戳进行比较
                if (
                  !value ||
                  !beginDateTime
                ) {
                  return Promise.resolve(); // 如果日期为空，则不进行比较，允许通过
                }

                const beginTimestamp = beginDateTime instanceof Date ? beginDateTime.valueOf() : new Date(beginDateTime).valueOf();
                const endTimestamp = value instanceof Date ? value.valueOf() : new Date(value).valueOf();

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

export default UpdateForm;
