import UpdateForm from '@/pages/ActivityCount/compoents/UpdateForm';
import AddForm from './compoents/AddForm';
import { delete_activity_count, query_activity_count } from '@/services/api';
import { ProDescriptions, PageContainer } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ReloadOutlined } from '@ant-design/icons';
import { App, Button, Card, Drawer, Empty, Popconfirm, Space, Spin, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const ActivityCount: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.ActivityCountItem>();
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<API.ActivityCountItem[]>([]);
  const { message } = App.useApp();

  const loadCounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await query_activity_count();
      setCounts(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      message.error('活动次数配置加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      const res = await delete_activity_count(id);
      if (res.code === 1000) {
        message.success('删除成功');
        if (currentRow?.id === id) {
          setCurrentRow(undefined);
          setShowDetail(false);
        }
        await loadCounts();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const descriptionColumns: ProDescriptionsItemProps<API.ActivityCountItem>[] = [
    { title: 'count_ID', dataIndex: 'id' },
    { title: '总次数', dataIndex: 'totalCount' },
    { title: '月次数', dataIndex: 'monthCount' },
    { title: '日次数', dataIndex: 'dayCount' },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
  ];

  const summaryText = useMemo(() => `共 ${counts.length} 个配置`, [counts.length]);

  return (
    <PageContainer pageHeaderRender={false}>
      <Card bordered={false} className={styles.pageCard}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTitleGroup}>
            <Typography.Text className={styles.pageHeaderTitle}>活动次数配置</Typography.Text>
            <Typography.Text type="secondary">{summaryText}</Typography.Text>
          </div>
          <Space size={12} wrap>
            <Button key="refresh" icon={<ReloadOutlined />} onClick={() => void loadCounts()}>
              刷新
            </Button>
            <Button
              type="primary"
              key="create"
              onClick={() => {
                setModalVisible(true);
              }}
            >
              + 新建配置
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          {counts.length === 0 ? (
            <div className={styles.emptyState}>
              <Empty description="暂无活动次数配置" />
            </div>
          ) : (
            <div className={styles.grid}>
              {counts.map((item) => (
                <Card key={item.id} className={styles.countCard} bordered={false} bodyStyle={{ padding: 0 }}>
                  <div className={styles.cardHeader}>
                    <Typography.Text className={styles.cardTitle}>
                      <span className={styles.inlineLabel}>标识：</span>
                      {item.id || '--'}
                    </Typography.Text>
                    <Space size={12} wrap className={styles.cardActions}>
                      <a
                        onClick={() => {
                          setCurrentRow(item);
                          setShowDetail(true);
                        }}
                      >
                        详情
                      </a>
                      <a
                        onClick={() => {
                          setCurrentRow(item);
                          setUpdateModalVisible(true);
                        }}
                      >
                        修改
                      </a>
                      <Popconfirm
                        title="确定删除该活动次数配置吗？"
                        onConfirm={() => void handleDelete(item.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <a className={styles.deleteAction}>删除</a>
                      </Popconfirm>
                    </Space>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={`${styles.metaCard} ${styles.totalCard}`}>
                      <Typography.Paragraph className={styles.metaInlineValue} ellipsis={{ rows: 1 }}>
                        <span className={styles.inlineLabel}>总次数：</span>
                        {item.totalCount || '--'}
                      </Typography.Paragraph>
                    </div>
                    <div className={`${styles.metaCard} ${styles.monthCard}`}>
                      <Typography.Paragraph className={styles.metaInlineValue} ellipsis={{ rows: 1 }}>
                        <span className={styles.inlineLabel}>月次数：</span>
                        {item.monthCount || '--'}
                      </Typography.Paragraph>
                    </div>
                    <div className={`${styles.metaCard} ${styles.dayCard}`}>
                      <Typography.Paragraph className={styles.metaInlineValue} ellipsis={{ rows: 1 }}>
                        <span className={styles.inlineLabel}>日次数：</span>
                        {item.dayCount || '--'}
                      </Typography.Paragraph>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Spin>
      </Card>

      <AddForm visible={modalVisible} onVisibleChange={setModalVisible} onFinish={() => void loadCounts()} />
      <UpdateForm
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={() => void loadCounts()}
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
          <ProDescriptions<API.ActivityCountItem>
            column={2}
            title={currentRow.id}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{ id: currentRow.id }}
            columns={descriptionColumns}
            extra={[
              <a
                key="update"
                onClick={() => {
                  setUpdateModalVisible(true);
                  setShowDetail(false);
                }}
              >
                修改
              </a>,
              <Popconfirm
                key="delete"
                title="确定删除该活动次数配置吗？"
                onConfirm={() => {
                  void handleDelete(currentRow.id);
                  setShowDetail(false);
                }}
                okText="确定"
                cancelText="取消"
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

export default ActivityCount;
