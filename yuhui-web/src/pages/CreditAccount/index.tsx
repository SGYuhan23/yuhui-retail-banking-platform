import { query_credit_account } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useState } from 'react';

const CreditAccount: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.CreditAccountItem>();

  const columns: ProColumns<API.CreditAccountItem>[] = [
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
      title: '总积分',
      dataIndex: 'totalAmount',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '可用积分',
      dataIndex: 'availableAmount',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '账户状态',
      dataIndex: 'accountStatus',
      ellipsis: false,
      valueEnum: {
        open: {
          text: '正常',
          status: 'Success',
        },
        close: {
          text: '冻结',
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

  const descriptionColumns: ProDescriptionsItemProps<API.CreditAccountItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: '总积分',
      dataIndex: 'totalAmount',
    },
    {
      title: '可用积分',
      dataIndex: 'availableAmount',
    },
    {
      title: '账户状态',
      dataIndex: 'accountStatus',
      valueEnum: {
        open: {
          text: '正常',
          status: 'Success',
        },
        close: {
          text: '冻结',
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
      <ProTable<API.CreditAccountItem, API.PageParams>
        rowKey="userId"
        request={query_credit_account}
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
          <ProDescriptions<API.CreditAccountItem>
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

export default CreditAccount;
