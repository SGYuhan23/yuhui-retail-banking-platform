import { auth_permission_create, auth_permission_delete, auth_permissions } from '@/services/api';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const AuthPermissions: React.FC = () => {
  const { message } = App.useApp();
  const [permissions, setPermissions] = useState<API.AuthPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await auth_permissions();
      if (resp?.code === 1000) {
        setPermissions(resp.data || []);
      } else {
        message.error(resp?.message || '权限列表加载失败');
      }
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    const values = await form.validateFields();
    const resp = await auth_permission_create(values);
    if (resp?.code === 1000) {
      message.success('权限已创建');
      setOpen(false);
      form.resetFields();
      load();
    } else {
      message.error(resp?.message || '创建失败');
    }
  };

  const remove = async (perm: API.AuthPermission) => {
    const resp = await auth_permission_delete(perm.id);
    if (resp?.code === 1000) {
      message.success('权限已删除');
      load();
    } else {
      message.error(resp?.message || '删除失败');
    }
  };

  const columns = [
    { title: '权限编码', dataIndex: 'code', width: 200, render: (v: string) => <Tag>{v}</Tag> },
    { title: '权限名称', dataIndex: 'name', width: 180 },
    { title: '资源', dataIndex: 'resource', width: 140, render: (v: string) => v || '--' },
    { title: '动作', dataIndex: 'action', width: 120, render: (v: string) => v || '--' },
    { title: '描述', dataIndex: 'description', render: (v: string) => v || '--' },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, p: API.AuthPermission) => (
        <Popconfirm title={`确定删除权限 ${p.code} 吗？已分配的角色将同时失去该权限`} onConfirm={() => remove(p)}>
          <Button size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      title="权限管理"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setOpen(true);
          }}
        >
          新建权限
        </Button>
      }
    >
      <Table rowKey="id" loading={loading} columns={columns as any} dataSource={permissions} pagination={false} />

      <Modal title="新建权限" open={open} onOk={submit} onCancel={() => setOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="code"
            label="权限编码"
            rules={[
              { required: true, message: '权限编码不能为空' },
              { pattern: /^[a-z0-9:_-]+$/i, message: '仅允许字母/数字/冒号/下划线/横线' },
            ]}
            extra="格式建议 resource:action，如 activity:write"
          >
            <Input placeholder="activity:write" />
          </Form.Item>
          <Form.Item name="name" label="权限名称" rules={[{ required: true, message: '权限名称不能为空' }]}>
            <Input placeholder="权限名称" />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex' }}>
            <Form.Item name="resource" label="资源" style={{ flex: 1 }}>
              <Input placeholder="resource" />
            </Form.Item>
            <Form.Item name="action" label="动作" style={{ flex: 1 }}>
              <Input placeholder="action" />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="权限描述" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AuthPermissions;
