import { delete_rule_tree_node_line, query_rule_tree_node_line } from '@/services/api';
import { ProDescriptions } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App, Button, Drawer, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import AddForm from './compoents/AddForm';
import UpdateForm from './compoents/UpdateForm';

const RuleTreeNodeLine: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false); // 控制修改表单可见性
  const [currentRow, setCurrentRow] = useState<API.RuleTreeNodeLineItem>(); // 存储当前编辑行的数据
  const [showDetail, setShowDetail] = useState<boolean>(false); // 控制详情抽屉可见性
  const actionRef = useRef<ActionType>();
  const { message: msg } = App.useApp(); // 获取 Ant Design 的 message 实例

  const handleDelete = async (record: { id: any }) => {
    try {
      const res = await delete_rule_tree_node_line(record);
      if (res.code === 1000) {
        msg.success('删除成功');
        actionRef.current?.reload();
      } else {
        msg.error('删除失败');
      }
    } catch (error) {
      msg.error('删除失败，请重试');
    }
  };

  const columns: ProColumns<API.RuleTreeNodeLineItem>[] = [
    {
      title: '节点连线ID',
      dataIndex: 'id',
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
      title: '奖品规则树ID',
      dataIndex: 'ruleTreeId',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '从',
      dataIndex: 'ruleNodeFrom',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '限定值',
      dataIndex: 'ruleLimitValue',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '到',
      dataIndex: 'ruleNodeTo',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '限定类型',
      dataIndex: 'ruleLimitType',
      valueType: 'textarea',
      ellipsis: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      ellipsis: false,
    },
    // {
    //   title: '更新时间',
    //   dataIndex: 'updateTime',
    //   valueType: 'dateTime',
    //   ellipsis: true,
    // },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="update"
          onClick={() => {
            setUpdateModalVisible(true);
            setCurrentRow(record);
          }}
        >
          修改
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除该奖品规则节点连线吗？"
          onConfirm={() => handleDelete(record.id as any)}
          okText="是"
          cancelText="否"
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  const descriptionColumns: ProDescriptionsItemProps<API.RuleTreeNodeLineItem>[] = [
    {
      title: '奖品规则节点ID',
      dataIndex: 'id',
    },
    {
      title: '奖品规则树ID',
      dataIndex: 'ruleTreeId',
    },
    {
      title: '从',
      dataIndex: 'ruleNodeFrom',
    },
    {
      title: '到',
      dataIndex: 'ruleNodeTo',
    },
    {
      title: '限定类型',
      dataIndex: 'ruleLimitType',
    },
    {
      title: '限定值',
      dataIndex: 'ruleLimitValue',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleItem, API.PageParams>
        headerTitle="奖品规则节点连线配置列表"
        actionRef={actionRef}
        rowKey="id"
        request={query_rule_tree_node_line}
        columns={columns}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setModalVisible(true);
            }}
          >
            + 新建节点连线
          </Button>,
        ]}
      />
      <AddForm
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        onFinish={() => actionRef.current?.reload()}
      />
      <UpdateForm
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={() => actionRef.current?.reload()}
        initialValues={currentRow || {}}
      />
      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
      >
        {currentRow && (
          <ProDescriptions<API.RuleTreeNodeLineItem>
            column={2}
            title={currentRow?.id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.id,
            }}
            columns={descriptionColumns}
            extra={[
              <a
                key="update"
                onClick={() => {
                  setUpdateModalVisible(true);
                  setShowDetail(false); // 关闭详情抽屉
                }}
              >
                修改
              </a>,
              <Popconfirm
                key="delete"
                title="确定删除该奖品规则节点连线吗？"
                onConfirm={() => {
                  handleDelete(currentRow?.id as any);
                  setShowDetail(false); // 关闭详情抽屉
                }}
                okText="是"
                cancelText="否"
              >
                <a>删除</a>
              </Popconfirm>,
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RuleTreeNodeLine;
