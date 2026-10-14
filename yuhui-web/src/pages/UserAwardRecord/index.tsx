import { query_user_award_record } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useState } from 'react';

const UserAwardRecord: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.UserAwardRecordItem>();

  const columns: ProColumns<API.UserAwardRecordItem>[] = [
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
      title: '抽奖策略ID',
      dataIndex: 'strategyId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '抽奖单ID',
      dataIndex: 'userOrderId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '奖品ID',
      dataIndex: 'awardId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '奖品标题',
      dataIndex: 'awardTitle',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '中奖时间',
      dataIndex: 'awardTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
    {
      title: '奖品状态',
      dataIndex: 'awardState',
      ellipsis: false,
      valueEnum: {
        create: {
          text: '待发放',
          status: 'Processing',
        },
        complete: {
          text: '已发放',
          status: 'Success',
        },
        fail: {
          text: '发放失败',
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
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<API.UserAwardRecordItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: '抽奖策略ID',
      dataIndex: 'strategyId',
    },
    {
      title: '抽奖单ID',
      dataIndex: 'userOrderId',
    },
    {
      title: '奖品ID',
      dataIndex: 'awardId',
    },
    {
      title: '奖品标题',
      dataIndex: 'awardTitle',
    },
    {
      title: '中奖时间',
      dataIndex: 'awardTime',
    },
    {
      title: '奖品状态',
      dataIndex: 'awardState',
      valueEnum: {
        create: {
          text: '待发放',
          status: 'Processing',
        },
        complete: {
          text: '已发放',
          status: 'Success',
        },
        fail: {
          text: '发放失败',
          status: 'Error',
        },
      },
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
      <ProTable<API.UserAwardRecordItem, API.PageParams>
        rowKey="userOrderId"
        request={query_user_award_record}
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
          <ProDescriptions<API.UserAwardRecordItem>
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

export default UserAwardRecord;
