import {
  auth_permission_create,
  
  auth_permissions,
  auth_role_assign_permissions,
  auth_role_create,
  auth_role_delete,
  auth_role_update,
  auth_roles,
} from '@/services/api';
import { DeleteOutlined, EditOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { App, Button, Card, Checkbox, Form, Input, Modal, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const AuthRoles: React.FC = () => {
  const { message } = App.useApp();
  const [roles, setRoles] = useState<API.AuthRole[]>([]);
  const [permissions, setPermissions] = useState<API.AuthPermission[]>([]);
  const [loading, setLoading] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<API.AuthRole | null>(null);
  const [roleForm] = Form.useForm();

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permForm] = Form.useForm();

  const [assignTarget, setAssignTarget] = useState<API.AuthRole | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [roleResp, permResp] = await Promise.all([auth_roles(), auth_permissions()]);
      if (roleResp?.code === 1000) {
        setRoles(roleResp.data || []);
      }
      if (permResp?.code === 1000) {
        setPermissions(permResp.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openCreateRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setRoleModalOpen(true);
  };

  const openEditRole = (role: API.AuthRole) => {
    setEditingRole(role);
    roleForm.setFieldsValue({ name: role.name, description: role.description });
    setRoleModalOpen(true);
  };

  const submitRole = async () => {
    const values = await roleForm.validateFields();
    const resp = editingRole
      ? await auth_role_update(editingRole.id, values)
      : await auth_role_create(values);
    if (resp?.code === 1000) {
      message.success(editingRole ? '角色已更新' : '角色已创建');
      setRoleModalOpen(false);
      loadAll();
    } else {
      message.error(resp?.message || '保存失败');
    }
  };

  const removeRole = async (role: API.AuthRole) => {
    const resp = await auth_role_delete(role.id);
    if (resp?.code === 1000) {
      message.success('角色已删除');
      loadAll();
    } else {
      message.error(resp?.message || '删除失败');
    }
  };

  const openAssign = (role: API.AuthRole) => {
    setAssignTarget(role);
    const codes = new Set(role.permissions || []);
    setSelectedPermIds((permissions || []).filter((p) => codes.has(p.code)).map((p) => p.id));
    setAssignOpen(true);
  };

  const submitAssign = async () => {
    const resp = await auth_role_assign_permissions(assignTarget!.id, selectedPermIds);
    if (resp?.code === 1000) {
      message.success('权限已更新');
      setAssignOpen(false);
      loadAll();
    } else {
      message.error(resp?.message || '权限分配失败');
    }
  };

  const submitPermission = async () => {
    const values = await permForm.validateFields();
    const resp = await auth_permission_create(values);
    if (resp?.code === 1000) {
      message.success('权限已创建');
      setPermModalOpen(false);
      permForm.resetFields();
      loadAll();
    } else {
      message.error(resp?.message || '创建失败');
    }
  };


  const columns = [
    { title: '角色编码', dataIndex: 'code', width: 180 },
    { title: '角色名称', dataIndex: 'name', width: 160 },
    { title: '描述', dataIndex: 'description' },
    {
      title: '权限',
      dataIndex: 'permissions',
      render: (perms: string[]) =>
        (perms || []).length ? (
          <Space wrap size={4}>
            {perms.map((p) => (
              <Tag key={p}>{p}</Tag>
            ))}
          </Space>
        ) : (
          <Tag>无权限</Tag>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      render: (_: any, r: API.AuthRole) => (
        <Space>
          <Button size="small" icon={<SafetyOutlined />} onClick={() => openAssign(r)}>
            分配权限
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditRole(r)}>
            编辑
          </Button>
          <Popconfirm title={`确定删除角色 ${r.name} 吗？`} onConfirm={() => removeRole(r)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="角色管理"
      extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateRole}>
            新建角色
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              permForm.resetFields();
              setPermModalOpen(true);
            }}
          >
            新建权限
          </Button>
        </Space>
      }
    >
      <Table rowKey="id" loading={loading} columns={columns as any} dataSource={roles} pagination={false} />

      <Modal
        title={editingRole ? `编辑角色 - ${editingRole.code}` : '新建角色'}
        open={roleModalOpen}
        onOk={submitRole}
        onCancel={() => setRoleModalOpen(false)}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" preserve={false}>
          {!editingRole && (
            <Form.Item
              name="code"
              label="角色编码"
              rules={[
                { required: true, message: '角色编码不能为空' },
                { pattern: /^[A-Za-z0-9_]+$/, message: '仅允许字母/数字/下划线' },
              ]}
              extra="建议以 ROLE_ 开头，如 ROLE_OPERATOR"
            >
              <Input placeholder="ROLE_XXX" />
            </Form.Item>
          )}
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '角色名称不能为空' }]}>
            <Input placeholder="角色名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="角色描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建权限"
        open={permModalOpen}
        onOk={submitPermission}
        onCancel={() => setPermModalOpen(false)}
        destroyOnClose
      >
        <Form form={permForm} layout="vertical" preserve={false}>
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

      <Modal
        title={`分配权限 - ${assignTarget?.name || ''}`}
        open={assignOpen}
        onOk={submitAssign}
        onCancel={() => setAssignOpen(false)}
        width={520}
        destroyOnClose
      >
        <div style={{ marginBottom: 8, color: '#999' }}>勾选该角色最终的权限集合（全量覆盖）</div>
        <Checkbox.Group
          value={selectedPermIds}
          onChange={(vals) => setSelectedPermIds(vals as string[])}
          style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflow: 'auto' }}
          options={permissions.map((p) => ({
            label: `${p.name}（${p.code}）`,
            value: p.id,
          }))}
        />
      </Modal>
    </Card>
  );
};

export default AuthRoles;
