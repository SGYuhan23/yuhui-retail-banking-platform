import { query_user_order } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import React, { useState } from 'react';
import { Drawer } from 'antd';

const UserOrder: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.UserOrderItem>();

  const columns: ProColumns<API.UserOrderItem>[] = [
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
      title: '活动名称',
      dataIndex: 'activityName',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '抽奖策略ID',
      dataIndex: 'strategyId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '订单状态',
      dataIndex: 'orderState',
      ellipsis: false,
      valueEnum: {
        create: {
          text: '待使用',
          status: 'Processing',
        },
        used: {
          text: '已使用',
          status: 'Success',
        },
        cancel: {
          text: '已作废',
          status: 'Error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
  ];

  const descriptionColumns: ProColumns<API.UserOrderItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
    },
    {
      title: '抽奖策略ID',
      dataIndex: 'strategyId',
    },
    {
      title: '订单状态',
      dataIndex: 'orderState',
      valueEnum: {
        create: {
          text: '待使用',
          status: 'Processing',
        },
        used: {
          text: '已使用',
          status: 'Success',
        },
        cancel: {
          text: '已作废',
          status: 'Error',
        },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.UserOrderItem, API.PageParams>
        rowKey="createTime"
        request={query_user_order}
        columns={columns}
        scroll={{ x: 'max-content' }}
      />
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
      >
        {currentRow && (
          <ProDescriptions<API.UserOrderItem>
            column={2}
            title={`用户ID: ${currentRow?.userId}`}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.userId,
            }}
            columns={descriptionColumns as ProDescriptionsItemProps<API.UserOrderItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UserOrder;
