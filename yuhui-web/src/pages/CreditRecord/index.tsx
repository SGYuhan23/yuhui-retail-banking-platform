import { query_credit_record } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd';
import React, { useState } from 'react';

const CreditRecord: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.CreditRecordItem>();

  const columns: ProColumns<API.CreditRecordItem>[] = [
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
      title: '交易名称',
      dataIndex: 'tradeName',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '交易类型',
      dataIndex: 'tradeType',
      ellipsis: false,
      valueEnum: {
        reverse: {
          text: '扣减',
        },
        forward: {
          text: '增加',
        },
      },
    },
    {
      title: '交易积分',
      dataIndex: 'tradeAmount',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '业务编号',
      dataIndex: 'outBusinessNo',
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

  const descriptionColumns: ProDescriptionsItemProps<API.CreditRecordItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: '交易名称',
      dataIndex: 'tradeName',
    },
    {
      title: '交易类型',
      dataIndex: 'tradeType',
      valueEnum: {
        reverse: {
          text: '扣减',
        },
        forward: {
          text: '增加',
        },
      },
    },
    {
      title: '交易积分',
      dataIndex: 'tradeAmount',
    },
    {
      title: '业务编号',
      dataIndex: 'outBusinessNo',
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
      <ProTable<API.CreditRecordItem, API.PageParams>
        rowKey="outBusinessNo"
        request={query_credit_record}
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
          <ProDescriptions<API.CreditRecordItem>
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

export default CreditRecord;
