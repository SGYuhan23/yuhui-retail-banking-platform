import { query_activity_record } from '@/services/api';
import {
  PageContainer,
  ProColumns,
  ProTable,
  ProDescriptions,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import { Drawer } from 'antd'; // 引入 Drawer
import React, { useState } from 'react';

const ActivityRecord: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.ActivityRecordItem>();

  const columns: ProColumns<API.ActivityRecordItem>[] = [
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
      title: 'sku',
      dataIndex: 'sku',
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
      title: '总次数',
      dataIndex: 'totalCount',
      valueType: 'textarea',
    },
    {
      title: '日次数',
      dataIndex: 'dayCount',
      valueType: 'textarea',
    },
    {
      title: '月次数',
      dataIndex: 'monthCount',
      valueType: 'textarea',
    },
    {
      title: '兑换所付积分',
      dataIndex: 'payAmount',
      valueType: 'textarea',
    },
    {
      title: '订单状态',
      dataIndex: 'state',
      valueEnum: {
        complete: {
          text: '已完成',
          status: 'Success',
        },
        wait_pay: {
          text: '待支付',
          status: 'Warning',
        },
      },
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

  // 为 ProDescriptions 定义单独的 columns
  const descriptionColumns: ProDescriptionsItemProps<API.ActivityRecordItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'userId',
    },
    {
      title: '活动ID',
      dataIndex: 'activityId',
    },
    {
      title: 'sku',
      dataIndex: 'sku',
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
    },
    {
      title: '总次数',
      dataIndex: 'totalCount',
    },
    {
      title: '日次数',
      dataIndex: 'dayCount',
    },
    {
      title: '月次数',
      dataIndex: 'monthCount',
    },
    {
      title: '兑换所付积分',
      dataIndex: 'payAmount',
    },
    {
      title: '订单状态',
      dataIndex: 'state',
      valueEnum: {
        complete: {
          text: '已完成',
          status: 'Success',
        },
        wait_pay: {
          text: '待支付',
          status: 'Warning',
        },
      },
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
      <ProTable<API.ActivityRecordItem, API.PageParams>
        rowKey="outBusinessNo"
        request={query_activity_record}
        columns={columns}
        scroll={{ x: 'max-content' }}
      ></ProTable>
      {/* 详情抽屉 */}
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
          <ProDescriptions<API.ActivityRecordItem>
            column={2}
            title={`用户ID: ${currentRow?.userId}`}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.userId,
            }}
            columns={descriptionColumns} // 使用新定义的 descriptionColumns
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ActivityRecord;
