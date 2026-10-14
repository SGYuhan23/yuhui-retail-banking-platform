import AddForm from './compoents/AddForm';
import UpdateForm from './compoents/UpdateForm';
import { delete_activity_sku, query_activity_sku } from '@/services/api';
import { ClusterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
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
import styles from './index.less';

type GroupedActivitySku = {
  activityId: string;
  items: API.ActivitySkuItem[];
};

const ActivitySku: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.ActivitySkuItem>();
  const [showDetail, setShowDetail] = useState(false);
  const [skus, setSkus] = useState<API.ActivitySkuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [createInitialValues, setCreateInitialValues] = useState<Partial<API.ActivitySkuItem>>(
    {},
  );
  const location = useLocation();
  const { message } = App.useApp();

  const loadActivitySkus = async () => {
    setLoading(true);
    try {
      const res = await query_activity_sku();
      setSkus(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      message.error('获取活动SKU列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadActivitySkus();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await delete_activity_sku(id);
      if (res.code === 1000) {
        message.success('删除成功');
        if (currentRow?.id === id) {
          setCurrentRow(undefined);
          setShowDetail(false);
        }
        await loadActivitySkus();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const groupedSkus = useMemo<GroupedActivitySku[]>(() => {
    const grouped = skus.reduce<Record<string, API.ActivitySkuItem[]>>((acc, item) => {
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
  }, [skus]);

  const allGroupKeys = useMemo(
    () => groupedSkus.map((item) => item.activityId),
    [groupedSkus],
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

  const descriptionColumns: ProDescriptionsItemProps<API.ActivitySkuItem>[] = [
    { title: 'sku_ID', dataIndex: 'id' },
    { title: '活动ID', dataIndex: 'activityId' },
    { title: 'count_ID', dataIndex: 'activityCountId' },
    { title: '总库存', dataIndex: 'stockCount' },
    { title: '剩余库存', dataIndex: 'stockCountSurplus' },
    { title: '兑换所需积分', dataIndex: 'productAmount' },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
  ];

  return (
    <PageContainer header={{ title: false, breadcrumb: undefined }}>
      <Card
        bordered={false}
        className={styles.pageCard}
        title="活动SKU配置"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadActivitySkus}>
              刷新全部
            </Button>
            <Button onClick={() => setActiveKeys(isAllExpanded ? [] : allGroupKeys)}>
              {isAllExpanded ? '一键收起全部' : '一键展开全部'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal()}>
              新建配置
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {groupedSkus.length === 0 ? (
            <Empty description="暂无活动SKU配置" />
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
              items={groupedSkus.map((group) => ({
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
                        <Button size="small" icon={<ReloadOutlined />} onClick={loadActivitySkus}>
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
                          className={styles.skuCard}
                          title={
                            <Typography.Text ellipsis className={styles.cardTitle}>
                              {item.id || '未命名SKU配置'}
                            </Typography.Text>
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
                                title="确定删除该活动SKU配置吗？"
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
                          <div className={styles.metaRow}>
                            <div className={`${styles.metaChip} ${styles.primaryChip}`}>
                              <span className={styles.infoLabel}>总库存</span>
                              <span className={styles.infoValue}>{item.stockCount || '--'}</span>
                            </div>
                            <div className={`${styles.metaChip} ${styles.warningChip}`}>
                              <span className={styles.infoLabel}>剩余库存</span>
                              <span className={styles.infoValue}>
                                {item.stockCountSurplus || '--'}
                              </span>
                            </div>
                            <div className={`${styles.metaChip} ${styles.amountChip}`}>
                              <span className={styles.infoLabel}>兑换所需积分</span>
                              <span className={styles.infoValue}>{item.productAmount || '--'}</span>
                            </div>
                          </div>
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
        onFinish={() => loadActivitySkus()}
      />

      <UpdateForm
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={() => loadActivitySkus()}
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
          <ProDescriptions<API.ActivitySkuItem>
            column={2}
            title={currentRow.id}
            request={async () => ({
              data: currentRow || {},
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
                title="确定删除该活动SKU配置吗？"
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

export default ActivitySku;
