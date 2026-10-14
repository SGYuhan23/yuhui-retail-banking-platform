import UpdateForm from '@/pages/Award/compoents/UpdateForm';
import AddForm from '@/pages/Award/compoents/AddForm';
import { delete_award, query_award } from '@/services/api';
import { ProDescriptions, PageContainer } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { ReloadOutlined } from '@ant-design/icons';
import { App, Button, Card, Drawer, Empty, Image, Popconfirm, Space, Spin, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';

const Award: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awards, setAwards] = useState<API.AwardItem[]>([]);
  const [currentRow, setCurrentRow] = useState<API.AwardItem>();
  const { message } = App.useApp();

  const loadAwards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await query_award();
      setAwards(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      message.error('奖品列表加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadAwards();
  }, [loadAwards]);

  const handleDelete = async (awardId?: string) => {
    if (!awardId) return;
    try {
      const res = await delete_award(awardId);
      if (res.code === 1000) {
        message.success('删除成功');
        if (currentRow?.id === awardId) {
          setCurrentRow(undefined);
          setShowDetail(false);
        }
        await loadAwards();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请稍后重试');
    }
  };

  const descriptionColumns: ProDescriptionsItemProps<API.AwardItem>[] = [
    {
      title: '奖品ID',
      dataIndex: 'id',
    },
    {
      title: '唯一标识',
      dataIndex: 'awardKey',
    },
    {
      title: '奖品配置',
      dataIndex: 'awardConfig',
    },
    {
      title: '内容描述',
      dataIndex: 'awardDesc',
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
    {
      title: '奖品图片',
      dataIndex: 'image',
      render: (_, record) =>
        record.image ? <Image src={record.image} width={96} height={96} style={{ objectFit: 'cover' }} /> : '--',
    },
  ];

  const summaryText = useMemo(() => `共 ${awards.length} 个奖品`, [awards.length]);

  return (
    <PageContainer pageHeaderRender={false}>
      <Card bordered={false} className={styles.pageCard}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTitleGroup}>
            <Typography.Text className={styles.pageHeaderTitle}>奖品配置</Typography.Text>
            <Typography.Text type="secondary">{summaryText}</Typography.Text>
          </div>
          <Space size={12} wrap>
            <Button key="refresh" icon={<ReloadOutlined />} onClick={() => void loadAwards()}>
              刷新
            </Button>
            <Button
              type="primary"
              key="create"
              onClick={() => {
                setModalVisible(true);
              }}
            >
              + 添加奖品
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          {awards.length === 0 ? (
            <div className={styles.emptyState}>
              <Empty description="暂无奖品配置" />
            </div>
          ) : (
            <div className={styles.grid}>
              {awards.map((award) => (
                <Card
                  key={award.id}
                  className={styles.awardCard}
                  bordered={false}
                  bodyStyle={{ padding: 0 }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.headerMain}>
                      <Typography.Text className={styles.cardTitle}>
                        <span className={styles.inlineLabel}>标识：</span>
                        {award.awardKey || '未命名奖品'}
                      </Typography.Text>
                    </div>
                    <Space size={12} wrap className={styles.cardActions}>
                      <a
                        onClick={() => {
                          setCurrentRow(award);
                          setShowDetail(true);
                        }}
                      >
                        详情
                      </a>
                      <a
                        onClick={() => {
                          setCurrentRow(award);
                          setUpdateModalVisible(true);
                        }}
                      >
                        修改
                      </a>
                      <Popconfirm
                        title="确定删除该奖品吗？"
                        onConfirm={() => void handleDelete(award.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <a className={styles.deleteAction}>删除</a>
                      </Popconfirm>
                    </Space>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.imagePanel}>
                      {award.image ? (
                        <Image
                          src={award.image}
                          alt={award.awardKey || '奖品图片'}
                          className={styles.awardImage}
                          preview={{ mask: '预览' }}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>暂无图片</div>
                      )}
                    </div>

                    <div className={styles.metaGrid}>
                      <div className={`${styles.metaCard} ${styles.metaPrimary}`}>
                        <Typography.Paragraph className={styles.metaInlineValue} ellipsis={{ rows: 1, expandable: true, symbol: '展开' }}>
                          <span className={styles.inlineLabel}>描述：</span>
                          {award.awardDesc || '暂无描述'}
                        </Typography.Paragraph>
                      </div>
                      <div className={`${styles.metaCard} ${styles.metaSecondary}`}>
                        <Typography.Paragraph className={styles.metaInlineValue} ellipsis={{ rows: 1, expandable: true, symbol: '展开' }}>
                          <span className={styles.inlineLabel}>配置：</span>
                          {award.awardConfig || '暂无配置'}
                        </Typography.Paragraph>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Spin>
      </Card>

      <AddForm visible={modalVisible} onVisibleChange={setModalVisible} onFinish={() => void loadAwards()} />
      <UpdateForm
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={() => void loadAwards()}
        initialValues={currentRow || {}}
      />

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
          <ProDescriptions<API.AwardItem>
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
                title="确定删除该奖品吗？"
                onConfirm={() => void handleDelete(currentRow.id)}
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

export default Award;
