import { history } from '@@/core/history';
import { delete_rule_tree, query_rule_tree } from '@/services/api';
import { ApartmentOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer, ProDescriptions } from '@ant-design/pro-components';
import type { ProDescriptionsItemProps } from '@ant-design/pro-components';
import { App, Button, Card, Col, Drawer, Empty, Popconfirm, Row, Space, Spin, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import AddForm from './compoents/AddForm';
import UpdateForm from './compoents/UpdateForm';
import styles from './index.less';

const RuleTree: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.RuleTreeItem>();
  const [showDetail, setShowDetail] = useState(false);
  const [trees, setTrees] = useState<API.RuleTreeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const loadTrees = async () => {
    setLoading(true);
    try {
      const res = await query_rule_tree();
      setTrees(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      message.error('获取规则树列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTrees();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await delete_rule_tree(id);
      if (Number(res?.code) === 1000) {
        message.success('删除成功');
        if (currentRow?.id === id) {
          setCurrentRow(undefined);
          setShowDetail(false);
        }
        await loadTrees();
      } else {
        message.error(res?.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const descriptionColumns: ProDescriptionsItemProps<API.RuleTreeItem>[] = [
    { title: '奖品规则树ID', dataIndex: 'id' },
    { title: '规则树名称', dataIndex: 'treeName' },
    { title: '规则树描述', dataIndex: 'treeDesc' },
    { title: '入口规则', dataIndex: 'treeNodeRuleKey' },
    { title: '创建时间', dataIndex: 'createTime', valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updateTime', valueType: 'dateTime' },
  ];

  const summaryText = useMemo(() => `共 ${trees.length} 个规则树`, [trees.length]);

  return (
    <PageContainer header={{ title: false, breadcrumb: undefined }}>
      <Card
        bordered={false}
        className={styles.pageCard}
        title={'规则树配置'}
        extra={
          <Space>
            <Typography.Text type="secondary">{summaryText}</Typography.Text>
            <Button icon={<ReloadOutlined />} onClick={() => void loadTrees()}>
              {'刷新'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              {'新建规则树'}
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {trees.length === 0 ? (
            <Empty description={'暂无规则树配置'} />
          ) : (
            <Row gutter={[16, 16]}>
              {trees.map((item) => (
                <Col xs={24} md={12} xl={8} key={item.id}>
                  <Card
                    hoverable
                    bordered={false}
                    className={styles.treeCard}
                    title={
                      <Typography.Text ellipsis className={styles.cardTitle}>
                        {item.treeName || '未命名规则树'}
                      </Typography.Text>
                    }
                    extra={
                      <Space size={4}>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => {
                            setCurrentRow(item);
                            setShowDetail(true);
                          }}
                        >
                          {'详情'}
                        </Button>
                        <Button
                          size="small"
                          type="link"
                          onClick={() => {
                            setCurrentRow(item);
                            setUpdateModalVisible(true);
                          }}
                        >
                          {'修改'}
                        </Button>
                        <Popconfirm
                          title={'确定删除该奖品规则树吗？'}
                          onConfirm={() => void handleDelete(String(item.id || ''))}
                          okText={'确定'}
                          cancelText={'取消'}
                        >
                          <Button type="link" size="small" danger>
                            {'删除'}
                          </Button>
                        </Popconfirm>
                      </Space>
                    }
                  >
                    <Space direction="vertical" size={12} className={styles.cardBody}>
                      <div className={styles.metaPanel}>
                        <Typography.Text className={styles.infoInlineText} ellipsis>
                          <span className={styles.inlineLabel}>{'规则树描述：'}</span>
                          {item.treeDesc || '--'}
                        </Typography.Text>
                      </div>
                      <div className={styles.metaInlineRow}>
                        <div className={`${styles.metaPanel} ${styles.entryPanel}`}>
                          <Typography.Text className={styles.infoInlineText} ellipsis>
                            <span className={styles.inlineLabel}>{'入口规则：'}</span>
                            {item.treeNodeRuleKey || '--'}
                          </Typography.Text>
                        </div>
                        <div className={`${styles.metaPanel} ${styles.editorPanel}`}>
                          <Button
                            type="default"
                            icon={<ApartmentOutlined />}
                            className={styles.editorButton}
                            onClick={() => {
                              history.push(`/strategy/tree-editor?ruleTreeId=${item.id}`);
                            }}
                          >
                            {'可视化编排'}
                          </Button>
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </Card>

      <AddForm
        visible={modalVisible}
        onVisibleChange={setModalVisible}
        onFinish={() => loadTrees()}
      />
      <UpdateForm
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        onFinish={() => loadTrees()}
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
          <ProDescriptions<API.RuleTreeItem>
            column={2}
            title={currentRow.id}
            request={async () => ({
              data: currentRow,
            })}
            params={{
              id: currentRow.id,
            }}
            columns={descriptionColumns}
            extra={[
              <Button
                key="editor"
                type="link"
                style={{ paddingInline: 0 }}
                icon={<ApartmentOutlined />}
                onClick={() => {
                  history.push(`/strategy/tree-editor?ruleTreeId=${currentRow.id}`);
                }}
              >
                {'可视化编排'}
              </Button>,
              <Button
                key="update"
                type="link"
                style={{ paddingInline: 0 }}
                onClick={() => {
                  setUpdateModalVisible(true);
                  setShowDetail(false);
                }}
              >
                {'修改'}
              </Button>,
              <Popconfirm
                key="delete"
                title={'确定删除该奖品规则树吗？'}
                onConfirm={() => void handleDelete(String(currentRow.id || ''))}
                okText={'确定'}
                cancelText={'取消'}
              >
                <Button type="link" size="small" danger style={{ paddingInline: 0 }}>
                  {'删除'}
                </Button>
              </Popconfirm>,
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default RuleTree;
