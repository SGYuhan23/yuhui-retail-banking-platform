import { query_user_behavior_rebate_order } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useState } from 'react';

const UserBehaviorRebateOrder: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.UserBehaviorRebateOrderItem>();

  const columns: ProColumns<API.UserBehaviorRebateOrderItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'textarea',
      render: (dom, entity) => {
        return (
          <a
            style={{ color: '#0862ec' }}
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '返利类型',
      dataIndex: 'behaviorType',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '返利描述',
      dataIndex: 'rebateDesc',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '返利配置',
      dataIndex: 'rebateConfig',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '业务编号',
      dataIndex: 'bizId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<API.UserBehaviorRebateOrderItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: '返利类型',
      dataIndex: 'behaviorType',
    },
    {
      title: '返利描述',
      dataIndex: 'rebateDesc',
    },
    {
      title: '返利配置',
      dataIndex: 'rebateConfig',
    },
    {
      title: '业务编号',
      dataIndex: 'bizId',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.UserBehaviorRebateOrderItem, API.PageParams>
        rowKey="bizId"
        request={query_user_behavior_rebate_order}
        columns={columns}
        scroll={{ x: 'max-content' }}
      ></ProTable>
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
      >
        {currentRow?.userId && (
          <ProDescriptions<API.UserBehaviorRebateOrderItem>
            column={2}
            title={`用户ID: ${currentRow?.userId}`}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.userId,
            }}
            columns={descriptionColumns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UserBehaviorRebateOrder;
