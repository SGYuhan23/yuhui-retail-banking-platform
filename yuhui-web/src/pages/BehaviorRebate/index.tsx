import { delete_behavior_rebate, query_behavior_rebate } from '@/services/api';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ClusterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  Collapse,
  Drawer,
  Empty,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@umijs/max';
import AddForm from './compoents/AddForm';
import UpdateForm from './compoents/UpdateForm';
import styles from './index.less';

type GroupedRebate = {
  activityId: string;
  items: API.BehaviorRebateItem[];
};

const BehaviorRebate: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.BehaviorRebateItem>();
  const [showDetail, setShowDetail] = useState(false);
  const [rebates, setRebates] = useState<API.BehaviorRebateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [createInitialValues, setCreateInitialValues] = useState<Partial<API.BehaviorRebateItem>>(
    {},
  );
  const location = useLocation();
  const { message } = App.useApp();

  const loadRebates = async () => {
    setLoading(true);
    try {
      const res = await query_behavior_rebate();
      setRebates(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      message.error('获取返利配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRebates();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await delete_behavior_rebate(id);
      if (res.code === 1000) {
        message.success('删除成功');
        if (currentRow?.id === id) {
          setCurrentRow(undefined);
          setShowDetail(false);
        }
        await loadRebates();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const groupedRebates = useMemo<GroupedRebate[]>(() => {
    const grouped = rebates.reduce<Record<string, API.BehaviorRebateItem[]>>((acc, item) => {
      const key = String(item.activityId || '未分组活动');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([activityId, items]) => ({
        activityId,
        items,
      }));
  }, [rebates]);

  const allGroupKeys = useMemo(
    () => groupedRebates.map((item) => item.activityId),
    [groupedRebates],
  );

  const targetActivityId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = params.get('activityId');
    return value ? String(value) : '';
  }, [location.search]);

  const isAllExpanded =
    allGroupKeys.length > 0 && allGroupKeys.every((key) => activeKeys.includes(key));

  useEffect(() => {
    if (targetActivityId && allGroupKeys.includes(targetActivityId)) {
      setActiveKeys([targetActivityId]);
      return;
    }
    setActiveKeys([]);
  }, [allGroupKeys, targetActivityId]);

  const openCreateModal = (activityId?: string) => {
    setCreateInitialValues(activityId ? { activityId } : {});
    setModalVisible(true);
  };

  const descriptionColumns: ProDescriptionsItemProps<API.BehaviorRebateItem>[] = [
    { title: '返利ID', dataIndex: 'id' },
    { title: '活动ID', dataIndex: 'activityId' },
    { title: '行为类型', dataIndex: 'behaviorType' },
    { title: '返利描述', dataIndex: 'rebateDesc' },
    { title: '返利类型', dataIndex: 'rebateType' },
    { title: '返利配置', dataIndex: 'rebateConfig' },
    {
      title: '状态',
      dataIndex: 'state',
      valueEnum: {
        open: { text: '开启', status: 'Success' },
        close: { text: '关闭', status: 'Error' },
      },
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
  ];

  return (
    <PageContainer header={{ title: false, breadcrumb: undefined }}>
      <Card
        bordered={false}
        className={styles.pageCard}
        title="返利配置列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadRebates}>
              刷新全部
            </Button>
            <Button onClick={() => setActiveKeys(isAllExpanded ? [] : allGroupKeys)}>
              {isAllExpanded ? '一键收起全部' : '一键展开全部'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal()}>
              新建返利配置
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {groupedRebates.length === 0 ? (
            <Empty description="暂无返利配置" />
          ) : (
            <Collapse
              className={styles.groupCollapse}
              activeKey={activeKeys}
              onChange={(keys) =>
                setActiveKeys(
                  Array.isArray(keys)
                    ? keys.map(String)
                    : keys
                      ? [String(keys)]
                      : [],
                )
              }
              items={groupedRebates.map((group) => ({
                key: group.activityId,
                label: (
                  <div className={styles.groupHeader}>
                    <Space size={12}>
                      <ClusterOutlined />
                      <Typography.Text strong>活动ID：{group.activityId}</Typography.Text>
                    </Space>
                    <div className={styles.groupHeaderRight}>
                      <div
                        className={styles.groupHeaderActions}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button size="small" icon={<ReloadOutlined />} onClick={loadRebates}>
                          刷新
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => openCreateModal(group.activityId)}
                        >
                          新建配置
                        </Button>
                      </div>
                      <Tag color="blue">{group.items.length} 条配置</Tag>
                    </div>
                  </div>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    {group.items.map((item) => (
                      <Col xs={24} md={12} xl={8} key={item.id}>
                        <Card
                          hoverable
                          bordered={false}
                          className={styles.rebateCard}
                          title={
                            <Space size={10}>
                              <Typography.Text ellipsis className={styles.cardTitle}>
                                {item.rebateDesc || item.behaviorType || '未命名返利'}
                              </Typography.Text>
                              {item.state === 'open' ? (
                                <Tag color="success">开启</Tag>
                              ) : (
                                <Tag color="error">关闭</Tag>
                              )}
                            </Space>
                          }
                          extra={
                            <Space size={4}>
                              <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                  setCurrentRow(item);
                                  setShowDetail(true);
                                }}
                              >
                                详情
                              </Button>
                              <Button
                                size="small"
                                type="link"
                                onClick={() => {
                                  setCurrentRow(item);
                                  setUpdateModalVisible(true);
                                }}
                              >
                                修改
                              </Button>
                              <Popconfirm
                                title="确定删除这条返利配置吗？"
                                onConfirm={() => handleDelete(String(item.id || ''))}
                                okText="确定"
                                cancelText="取消"
                              >
                                <Button type="link" size="small" danger>
                                  删除
                                </Button>
                              </Popconfirm>
                            </Space>
                          }
                        >
                          <Space direction="vertical" size={12} className={styles.cardBody}>
                            <div className={styles.metaRow}>
                              <div className={`${styles.metaChip} ${styles.behaviorChip}`}>
                                <span className={styles.infoLabel}>行为类型</span>
                                <span className={styles.infoValue}>{item.behaviorType || '--'}</span>
                              </div>
                              <div className={`${styles.metaChip} ${styles.rebateChip}`}>
                                <span className={styles.infoLabel}>返利类型</span>
                                <span className={styles.infoValue}>{item.rebateType || '--'}</span>
                              </div>
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ),
              }))}
            />
          )}
        </Spin>
      </Card>

      <AddForm
        visible={modalVisible}
        initialValues={createInitialValues}
        onVisibleChange={(visible) => {
          setModalVisible(visible);
          if (!visible) {
            setCreateInitialValues({});
          }
        }}
        onFinish={() => loadRebates()}
      />

      <UpdateForm
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={() => loadRebates()}
        initialValues={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable
      >
        {currentRow && (
          <ProDescriptions<API.BehaviorRebateItem>
            column={2}
            title={currentRow.id}
            request={async () => ({
              data: currentRow,
            })}
            params={{ id: currentRow.id }}
            columns={descriptionColumns}
            extra={[
              <Button
                key="update"
                type="link"
                style={{ paddingInline: 0 }}
                onClick={() => {
                  setUpdateModalVisible(true);
                  setShowDetail(false);
                }}
              >
                修改
              </Button>,
              <Popconfirm
                key="delete"
                title="确定删除这条返利配置吗？"
                onConfirm={() => {
                  handleDelete(String(currentRow.id || ''));
                  setShowDetail(false);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger style={{ paddingInline: 0 }}>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default BehaviorRebate;
