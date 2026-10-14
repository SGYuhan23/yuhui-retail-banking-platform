import { query_activity_account } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useState } from 'react';

const ActivityAccount: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.ActivityAccountItem>();

  const columns: ProColumns<API.ActivityAccountItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 160,
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
      title: '总次数',
      dataIndex: 'totalCount',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '剩余总次数',
      dataIndex: 'totalCountSurplus',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '月次数',
      dataIndex: 'monthCount',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '剩余月次数',
      dataIndex: 'monthCountSurplus',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '日次数',
      dataIndex: 'dayCount',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '剩余日次数',
      dataIndex: 'dayCountSurplus',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<API.ActivityAccountItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: '总次数',
      dataIndex: 'totalCount',
    },
    {
      title: '剩余总次数',
      dataIndex: 'totalCountSurplus',
    },
    {
      title: '月次数',
      dataIndex: 'monthCount',
    },
    {
      title: '剩余月次数',
      dataIndex: 'monthCountSurplus',
    },
    {
      title: '日次数',
      dataIndex: 'dayCount',
    },
    {
      title: '剩余日次数',
      dataIndex: 'dayCountSurplus',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ActivityAccountItem, API.PageParams>
        rowKey={(record) => `${record.userId}-${record.activityId}`}
        request={query_activity_account}
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
          <ProDescriptions<API.ActivityAccountItem>
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

export default ActivityAccount;
