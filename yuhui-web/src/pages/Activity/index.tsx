import { armory_activity, delete_activity, query_activity } from '@/services/api';
import { ProDescriptions } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { history } from '@umijs/max';
import AddForm from './compoents/AddForm';
import UpdateForm from './compoents/UpdateForm';
import styles from './index.less';

const PAGE_SIZE = 6;

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : value;
};

const Activity: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.ActivityItem>();
  const [activities, setActivities] = useState<API.ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingArmory, setLoadingArmory] = useState<Record<string, boolean>>({});
  const { message } = App.useApp();

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await query_activity();
      const data = Array.isArray(res?.data) ? res.data : [];
      const sorted = [...data].sort(
        (a, b) => dayjs(b.createTime || 0).valueOf() - dayjs(a.createTime || 0).valueOf(),
      );
      setActivities(sorted);
    } catch (error) {
      message.error('获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await delete_activity(id);
      if (res.code === 1000) {
        message.success('删除成功');
        if (currentRow?.id === id) {
          setCurrentRow(undefined);
          setShowDetail(false);
        }
        await loadActivities();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const handleArmory = async (activityId: string) => {
    try {
      const res = await armory_activity(activityId);
      if (res.code === 1000) {
        message.success('预热成功');
      } else {
        message.error(res.message || '预热失败');
      }
    } catch (error) {
      message.error('预热失败');
    }
  };

  const triggerArmory = async (activityId?: string) => {
    if (!activityId || loadingArmory[activityId]) {
      return;
    }
    setLoadingArmory((prev) => ({ ...prev, [activityId]: true }));
    await handleArmory(activityId);
    setLoadingArmory((prev) => ({ ...prev, [activityId]: false }));
  };

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return activities.slice(start, start + PAGE_SIZE);
  }, [activities, currentPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [activities.length, currentPage]);

  const stats = useMemo(() => {
    const total = activities.length;
    const openCount = activities.filter((item) => item.state === 'open').length;
    return {
      total,
      openCount,
      closeCount: total - openCount,
    };
  }, [activities]);

  const descriptionColumns: ProDescriptionsItemProps<API.ActivityItem>[] = [
    { title: '活动ID', dataIndex: 'id', copyable: true },
    { title: '活动名称', dataIndex: 'activityName' },
    { title: '活动描述', dataIndex: 'activityDesc', valueType: 'textarea' },
    { title: '开始时间', dataIndex: 'beginDateTime', valueType: 'dateTime' },
    { title: '结束时间', dataIndex: 'endDateTime', valueType: 'dateTime' },
    { title: '策略ID', dataIndex: 'strategyId', copyable: true },
    {
      title: '活动状态',
      dataIndex: 'state',
      render: (_, entity) =>
        entity.state === 'open' ? <Tag color="success">开启</Tag> : <Tag color="default">结束</Tag>,
    },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={8}>
          <Card className={styles.statCardBlue} bordered={false}>
            <Statistic title="活动总数" value={stats.total} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={styles.statCardGold} bordered={false}>
            <Statistic
              title="进行中活动"
              value={stats.openCount}
              valueStyle={{ color: '#155eef' }}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={styles.statCardDark} bordered={false}>
            <Statistic
              title="已结束活动"
              value={stats.closeCount}
              valueStyle={{ color: '#475467' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        bordered={false}
        className={styles.listCard}
        title={<span className={styles.sectionTitle}>活动列表</span>}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadActivities}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              新建活动
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {activities.length === 0 ? (
            <Empty description="暂无活动数据" className={styles.emptyBlock} />
          ) : (
            <>
              <Row gutter={[18, 18]}>
                {paginatedActivities.map((item) => {
                  const itemId = String(item.id || '');
                  const strategyId = String(item.strategyId || '');
                  const isOpen = item.state === 'open';

                  return (
                    <Col xs={24} xl={12} xxl={8} key={itemId}>
                      <Card
                        hoverable
                        bordered={false}
                        className={styles.activityCard}
                        title={
                          <div className={styles.cardTitleWrap}>
                            <Typography.Text ellipsis className={styles.cardTitle}>
                              {item.activityName || '未命名活动'}
                            </Typography.Text>
                            {isOpen ? (
                              <Tag color="success" className={styles.stateTag}>
                                开启
                              </Tag>
                            ) : (
                              <Tag color="default" className={styles.stateTag}>
                                结束
                              </Tag>
                            )}
                          </div>
                        }
                        extra={
                          <Space size={4}>
                            <Button
                              size="small"
                              disabled={!!loadingArmory[itemId]}
                              onClick={() => triggerArmory(itemId)}
                            >
                              {loadingArmory[itemId] ? '预热中...' : '预热'}
                            </Button>
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
                              title="确定删除该活动吗？"
                              onConfirm={() => handleDelete(itemId)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button size="small" type="link" danger>
                                删除
                              </Button>
                            </Popconfirm>
                          </Space>
                        }
                      >
                        <Space direction="vertical" size={14} className={styles.cardBody}>
                          <Typography.Paragraph ellipsis={{ rows: 2 }} className={styles.descText}>
                            {item.activityDesc || '暂无描述'}
                          </Typography.Paragraph>

                          <div className={styles.timelineBlock}>
                            <div className={styles.timelineItem}>
                              <CalendarOutlined />
                              <span>开始：{formatDateTime(item.beginDateTime)}</span>
                            </div>
                            <div className={styles.timelineItem}>
                              <ClockCircleOutlined />
                              <span>结束：{formatDateTime(item.endDateTime)}</span>
                            </div>
                          </div>

                          <div className={styles.configActions}>
                            <Button
                              block
                              className={styles.configButton}
                              onClick={() =>
                                history.push(
                                  `/rebate/behavior_rebate?activityId=${encodeURIComponent(itemId)}`,
                                )
                              }
                            >
                              活动返利配置
                            </Button>
                            <Button
                              block
                              className={styles.configButton}
                              onClick={() =>
                                history.push(
                                  `/rebate/activity_sku?activityId=${encodeURIComponent(itemId)}`,
                                )
                              }
                            >
                              活动SKU配置
                            </Button>
                            <Button
                              block
                              className={styles.configButton}
                              disabled={!strategyId}
                              onClick={() =>
                                history.push(
                                  `/admin/activity-award?activityId=${encodeURIComponent(itemId)}`,
                                )
                              }
                            >
                              活动奖品配置
                            </Button>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <div className={styles.paginationWrap}>
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={activities.length}
                  showSizeChanger={false}
                  onChange={setCurrentPage}
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                />
              </div>
            </>
          )}
        </Spin>
      </Card>

      <AddForm
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        onFinish={async () => {
          setModalVisible(false);
          await loadActivities();
        }}
      />

      {currentRow && (
        <UpdateForm
          visible={updateModalVisible}
          onVisibleChange={setUpdateModalVisible}
          initialValues={currentRow}
          onFinish={async () => {
            setUpdateModalVisible(false);
            setCurrentRow(undefined);
            await loadActivities();
          }}
        />
      )}

      <Drawer
        width={720}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable
      >
        {currentRow && (
          <ProDescriptions<API.ActivityItem>
            column={2}
            title={`活动详情 · ${currentRow.id}`}
            request={async () => ({
              data: currentRow,
            })}
            params={{ id: currentRow.id }}
            columns={descriptionColumns}
            extra={[
              <Button
                key="armory"
                size="small"
                disabled={!!loadingArmory[String(currentRow.id || '')]}
                onClick={() => triggerArmory(String(currentRow.id || ''))}
              >
                {loadingArmory[String(currentRow.id || '')] ? '预热中...' : '预热'}
              </Button>,
              <Button
                key="update"
                size="small"
                type="link"
                onClick={() => {
                  setUpdateModalVisible(true);
                  setShowDetail(false);
                }}
              >
                修改
              </Button>,
              <Popconfirm
                key="delete"
                title="确定删除该活动吗？"
                onConfirm={() => handleDelete(String(currentRow.id || ''))}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" type="link" danger>
                  删除
                </Button>
              </Popconfirm>,
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default Activity;
