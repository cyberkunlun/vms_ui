<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  initialTab?: string
}>()

const activeMenu = ref(props.initialTab || 'user')

watch(() => props.initialTab, (newTab) => {
  if (newTab) {
    activeMenu.value = newTab
  }
})

const menus = [
  { label: 'User Management', value: 'user', icon: '👥' },
  { label: 'Role Management', value: 'role', icon: '🔐' },
  { label: 'Department Management', value: 'dept', icon: '🏢' },
  { label: 'Log Audit', value: 'log', icon: '📑' },
  { label: 'Device Management', value: 'device', icon: '📹' },
  { label: 'Region Management', value: 'area', icon: '🌍' },
  { label: 'Menu Management', value: 'menu', icon: '📜' }
]

// Mock Data for Area
const areaData = [
  { name: 'Oman', parent: 'Top-level Region', status: 'Enabled', sort: 0, time: '2025/6/16 04:15:02' },
  { name: 'Muscat', parent: 'Oman', status: 'Enabled', sort: 1, time: '2025/6/16 05:21:19' },
  { name: 'Al Batinah North', parent: 'Oman', status: 'Enabled', sort: 2, time: '2025/6/16 05:23:34' },
  { name: 'Al Batinah South', parent: 'Oman', status: 'Enabled', sort: 3, time: '2025/6/16 05:24:29' }
]

// Mock Data for Device
const deviceData = [
  { name: 'Gate3-Exit', ip: '10.215.145.58', port: 554, usage: 'Online-play ANPR', account: 'admin', status: 'Online' },
  { name: 'Gate C2 Right-32', ip: '10.7.17.32', port: 554, usage: 'Online-play FR', account: 'admin', status: 'Online' },
  { name: 'Arrival Domestic-49', ip: '10.7.17.49', port: 554, usage: 'Online-play FR', account: 'admin', status: 'Online' }
]

// Mock Data for User
const userData = [
  { id: 1, account: 'superadmin', name: 'superadmin', dept: 'System', phone: '18818260277', status: true, time: '2021-01-05 13:03:47' }
]

// Mock Data for Role
const roleData = [
  { code: 101, name: 'Test', type: 'Customization', mark: 'test', sort: 0, status: 'Enable', time: '2021-01-06 09:49:35' },
  { code: 1, name: 'Super administrator', type: 'Built-in', mark: 'super_admin', sort: 1, status: 'Enable', time: '2021-01-05 13:03:48' }
]

// Mock Data for Menu
const menuData = [
  { name: 'Tenant management', icon: '🏠', sort: 0, permission: '', component: '', status: true },
  { name: 'VMS', icon: '📹', sort: 3, permission: '', component: '', status: true },
  { name: 'Vehicle Database', icon: '🗄️', sort: 3, permission: '', component: 'vehicle_db/index', status: true },
  { name: 'Vehicle', icon: '🚗', sort: 3, permission: '', component: 'vehicle/index', status: true },
  { name: 'Retrieval', icon: '🔍', sort: 6, permission: '', component: 'retrieval/index', status: true },
  { name: 'Message center', icon: '💬', sort: 7, permission: '', component: '', status: true },
  { name: 'Alarm', icon: '🔔', sort: 7, permission: '', component: '', status: true },
  { name: 'Event Center', icon: '🚨', sort: 7, permission: '', component: 'event/index', status: true }
]

// Mock Data for Permission Plan
const permPlanData = [
  { code: 130, name: 'wztest1123', status: 'Enable' },
  { code: 118, name: 'ISS_PLAN', status: 'Enable' },
  { code: 113, name: 'RO_PLAN', status: 'Enable' },
  { code: 111, name: 'ROP_PLAN', status: 'Enable' }
]

const logData = [
  { id: 1, user: 'admin', type: 'Login', module: 'System', content: 'User admin logged in successfully', ip: '192.168.1.100', time: '2024-01-15 10:32:45' },
  { id: 2, user: 'operator1', type: 'Update', module: 'Device', content: 'Modified device Gate3-Exit parameters', ip: '192.168.1.105', time: '2024-01-15 11:15:20' },
  { id: 3, user: 'admin', type: 'Delete', module: 'User', content: 'Deleted user viewer2', ip: '192.168.1.100', time: '2024-01-14 15:20:10' }
]

const showPermModal = ref(false)
const editingPlan = ref<any>(null)

const openPermConfig = (plan: any) => {
  editingPlan.value = plan
  showPermModal.value = true
}
</script>

<template>
  <div class="system-mgmt-view">
    <!-- Left Sidebar -->
    <aside class="mgmt-sidebar">
      <div class="sidebar-header">系统管理</div>
      <div class="menu-list">
        <div 
          v-for="menu in menus" 
          :key="menu.value"
          class="menu-item"
          :class="{ active: activeMenu === menu.value }"
          @click="activeMenu = menu.value"
        >
          <span class="icon">{{ menu.icon }}</span>
          <span class="label">{{ menu.label }}</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="mgmt-main">
      <!-- Breadcrumb / Header -->
      <div class="content-header">
        <div class="breadcrumb">首页 / 系统管理 / {{ menus.find(m => m.value === activeMenu)?.label }}</div>
        <div class="actions">
          <button class="btn add-btn" v-if="activeMenu === 'area'">+ Add Region</button>
          <button class="btn add-btn" v-if="activeMenu === 'device'">Create device</button>
          <button class="btn add-btn" v-if="activeMenu === 'user' || activeMenu === 'role' || activeMenu === 'dept'">+ Add</button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <template v-if="activeMenu === 'area'">
          <div class="filter-item"><span class="label">Name</span><input type="text" placeholder="Enter region name" /></div>
          <div class="filter-item"><span class="label">Parent</span><select><option>Select parent region</option></select></div>
        </template>
        <template v-if="activeMenu === 'device'">
          <div class="filter-item"><span class="label">Device Name</span><input type="text" placeholder="Enter device name" /></div>
          <div class="filter-item"><span class="label">IP</span><input type="text" placeholder="Please enter ip" /></div>
        </template>
        <template v-if="activeMenu === 'user'">
          <div class="filter-item"><span class="label">User Name</span><input type="text" placeholder="Please input user name" /></div>
        </template>
        <template v-if="activeMenu === 'perm'">
          <div class="filter-item"><span class="label">Plan name</span><input type="text" placeholder="Please input Plan name" /></div>
        </template>
        <template v-if="activeMenu === 'menu'">
          <div class="filter-item"><span class="label">Menu name</span><input type="text" placeholder="Please input Menu name" /></div>
        </template>
        <div class="filter-actions">
          <button class="btn search-btn">Search</button>
          <button class="btn reset-btn">Reset</button>
          <button class="btn add-btn" v-if="activeMenu === 'menu'">Refresh menu cache</button>
        </div>
      </div>

      <!-- Table Area -->
      <div class="table-container">
        <!-- Area Table -->
        <table v-if="activeMenu === 'area'" class="mgmt-table">
          <thead>
            <tr>
              <th>Region Name</th>
              <th>Parent Region</th>
              <th>Status</th>
              <th>Sort</th>
              <th>Created Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in areaData" :key="item.name">
              <td><span class="tree-node">▶</span> {{ item.name }}</td>
              <td>{{ item.parent }}</td>
              <td><span class="status-tag enabled">{{ item.status }}</span></td>
              <td>{{ item.sort }}</td>
              <td>{{ item.time }}</td>
              <td class="ops">
                <button class="op-btn view">View</button>
                <button class="op-btn add">Add</button>
                <button class="op-btn edit">Edit</button>
                <button class="op-btn delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Device Table -->
        <table v-if="activeMenu === 'device'" class="mgmt-table">
          <thead>
            <tr>
              <th>Device Name</th>
              <th>Device IP</th>
              <th>Port</th>
              <th>Device Usage</th>
              <th>Account</th>
              <th>Running Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in deviceData" :key="item.ip">
              <td>{{ item.name }}</td>
              <td class="link-text">{{ item.ip }}</td>
              <td>{{ item.port }}</td>
              <td><span class="usage-tag">{{ item.usage }}</span></td>
              <td>{{ item.account }}</td>
              <td><span class="status-tag online">{{ item.status }}</span></td>
              <td class="ops">
                <button class="op-btn edit">Edit</button>
                <button class="op-btn more">More</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- User Table -->
        <table v-if="activeMenu === 'user'" class="mgmt-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Account</th>
              <th>User Name</th>
              <th>Dept</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in userData" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.account }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.dept }}</td>
              <td>{{ item.phone }}</td>
              <td><div class="switch" :class="{ on: item.status }"></div></td>
              <td class="ops">
                <button class="op-btn edit">Modify</button>
                <button class="op-btn more">More</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Role Table -->
        <table v-if="activeMenu === 'role'" class="mgmt-table">
          <thead>
            <tr>
              <th>Role Code</th>
              <th>Role Name</th>
              <th>Role Type</th>
              <th>Role Mark</th>
              <th>Status</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in roleData" :key="item.code">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td><span class="type-tag" :class="item.type.toLowerCase()">{{ item.type }}</span></td>
              <td>{{ item.mark }}</td>
              <td><span class="status-tag enabled">{{ item.status }}</span></td>
              <td class="ops">
                <button class="op-btn edit">Modify</button>
                <button class="op-btn delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Permission Plan Table -->
        <table v-if="activeMenu === 'perm'" class="mgmt-table">
          <thead>
            <tr>
              <th>Plan Code</th>
              <th>Plan name</th>
              <th>Operate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in permPlanData" :key="item.code">
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td class="ops">
                <button class="op-btn edit" @click="openPermConfig(item)">Modify</button>
                <button class="op-btn delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Log Audit Table -->
        <table v-if="activeMenu === 'log'" class="mgmt-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Operator</th>
              <th>Action Type</th>
              <th>Module</th>
              <th>Content</th>
              <th>IP Address</th>
              <th>Operation Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in logData" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.user }}</td>
              <td><span class="type-tag customization">{{ item.type }}</span></td>
              <td>{{ item.module }}</td>
              <td>{{ item.content }}</td>
              <td>{{ item.ip }}</td>
              <td>{{ item.time }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Menu Management Table -->
        <table v-if="activeMenu === 'menu'" class="mgmt-table">
          <thead>
            <tr>
              <th>Menu name</th>
              <th>Icon</th>
              <th>Sort</th>
              <th>Permission</th>
              <th>Component</th>
              <th>Status</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in menuData" :key="item.name">
              <td><span class="tree-node">▶</span> {{ item.name }}</td>
              <td class="icon-td">{{ item.icon }}</td>
              <td>{{ item.sort }}</td>
              <td>{{ item.permission }}</td>
              <td>{{ item.component }}</td>
              <td><div class="switch" :class="{ on: item.status }"></div></td>
              <td class="ops">
                <button class="op-btn edit">Modify</button>
                <button class="op-btn add">Add</button>
                <button class="op-btn delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Permission Modal -->
      <div v-if="showPermModal" class="modal-overlay" @click.self="showPermModal = false">
        <div class="perm-modal">
          <div class="modal-header">
            <span class="title">Update</span>
            <div class="header-btns">
              <button class="icon-btn">⛶</button>
              <button class="close-btn" @click="showPermModal = false">×</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <span class="label">Plan name</span>
              <input type="text" v-model="editingPlan.name" />
            </div>
            
            <div class="perm-config-area">
              <div class="config-section">
                <div class="section-header">
                  <span class="title">Scope</span>
                  <div class="switch-item">
                    <span>Menu permission</span>
                    <div class="switch on"></div>
                  </div>
                </div>
                <div class="tree-box">
                  <div class="tree-item"><input type="checkbox"> Tenant management</div>
                  <div class="tree-item active"><input type="checkbox" checked> VMS
                    <div class="tree-children">
                      <div class="tree-item"><input type="checkbox" checked> Vehicle Database</div>
                      <div class="tree-item"><input type="checkbox" checked> Vehicle</div>
                      <div class="tree-item"><input type="checkbox" checked> Retrieval</div>
                    </div>
                  </div>
                  <div class="tree-item"><input type="checkbox" checked> Alarm</div>
                </div>
              </div>

              <div class="config-section">
                <div class="section-header">
                  <span class="title">Data permission</span>
                </div>
                <div class="search-input">
                  <input type="text" placeholder="Search" />
                </div>
                <div class="tree-box">
                  <div class="tree-item"><span class="tree-node">▼</span> 📁 Oman
                    <div class="tree-children">
                      <div class="tree-item"><input type="checkbox"> 📄 Ash Sharqiyah North</div>
                      <div class="tree-item"><input type="checkbox"> 📄 Al Batinah North</div>
                      <div class="tree-item active"><span class="tree-node">▼</span> 📁 Ad Dakhiliyah
                        <div class="tree-children">
                          <div class="tree-item active"><span class="tree-node">▼</span> 📄 Nizwa
                            <div class="tree-children">
                              <div class="tree-item active"><input type="checkbox" checked> 📄 Green Mountain</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-item row">
              <span class="label">Status</span>
              <div class="radio-group">
                <label><input type="radio" name="status" checked> Enable</label>
                <label><input type="radio" name="status"> Disable</label>
              </div>
            </div>

            <div class="form-item">
              <span class="label">Remark</span>
              <input type="text" v-model="editingPlan.name" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="confirm-btn" @click="showPermModal = false">Confirm</button>
            <button class="cancel-btn" @click="showPermModal = false">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar">
        <span class="total">Total {{ activeMenu === 'area' ? areaData.length : activeMenu === 'device' ? deviceData.length : 1 }}</span>
        <select><option>10/page</option></select>
        <div class="pager">
          <button class="arrow">‹</button>
          <span class="page-num active">1</span>
          <button class="arrow">›</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.system-mgmt-view {
  height: 100%;
  display: flex;
  background: #010816;
  color: #fff;
  overflow: hidden;
}

.mgmt-sidebar {
  width: 220px;
  background: rgba(15, 23, 42, 0.4);
  border-right: 1px solid rgba(56, 189, 248, 0.1);
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #38bdf8;
    border-bottom: 1px solid rgba(56, 189, 248, 0.05);
  }

  .menu-list {
    padding: 10px;
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      border-radius: 6px;
      cursor: pointer;
      color: #94a3b8;
      transition: all 0.2s;
      margin-bottom: 4px;

      &:hover { background: rgba(56, 189, 248, 0.05); color: #fff; }
      &.active {
        background: rgba(56, 189, 248, 0.15);
        color: #00f7ff;
        border: 1px solid rgba(56, 189, 248, 0.2);
      }
      .icon { font-size: 16px; }
      .label { font-size: 14px; }
    }
  }
}

.mgmt-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, #0a1a3a 0%, #010816 100%);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .breadcrumb { font-size: 13px; color: #64748b; }
  .add-btn {
    background: #3b82f6; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;
    font-size: 13px; &:hover { background: #2563eb; }
  }
}

.filter-bar {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.1);
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;

  .filter-item {
    display: flex;
    align-items: center;
    gap: 10px;
    .label { font-size: 13px; color: #94a3b8; white-space: nowrap; }
    input, select {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #fff;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      outline: none;
      min-width: 160px;
    }
  }

  .filter-actions {
    display: flex;
    gap: 10px;
    margin-left: auto;
    .search-btn { background: #3b82f6; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
    .reset-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; padding: 6px 16px; border-radius: 4px; cursor: pointer; }
  }
}

.table-container {
  flex: 1;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 8px;
}

.mgmt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    background: rgba(15, 23, 42, 0.8);
    color: #94a3b8;
    text-align: left;
    padding: 12px 15px;
    font-weight: 600;
    border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  }

  td {
    padding: 12px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    color: #e2e8f0;
    
    .tree-node { color: #64748b; font-size: 10px; margin-right: 5px; cursor: pointer; }
    .link-text { color: #3b82f6; cursor: pointer; }
    
    .status-tag {
      padding: 2px 8px; border-radius: 4px; font-size: 11px;
      &.enabled, &.online { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    }

    .usage-tag {
      background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;
    }

    .type-tag {
      padding: 2px 6px; border-radius: 4px; font-size: 11px;
      &.customization { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
      &.built-in { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    }

    .switch {
      width: 36px; height: 18px; background: #334155; border-radius: 10px; position: relative; cursor: pointer;
      &::after { content: ''; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: 0.2s; }
      &.on { background: #3b82f6; &::after { left: 20px; } }
    }
  }

  tr:hover { background: rgba(56, 189, 248, 0.02); }

  .icon-td { font-size: 16px; text-align: center; }

  .ops {
    display: flex; gap: 8px;
    .op-btn {
      background: transparent; border: 1px solid rgba(148, 163, 184, 0.2); color: #94a3b8;
      padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;
      &:hover { border-color: #38bdf8; color: #38bdf8; }
      &.delete:hover { border-color: #ef4444; color: #ef4444; }
    }
  }
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 20px;
  font-size: 13px;
  color: #94a3b8;
  
  select { background: rgba(0,0,0,0.3); border: 1px solid #334155; color: #fff; padding: 4px 8px; border-radius: 4px; }
  
  .pager {
    display: flex; gap: 8px;
    .page-num {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border: 1px solid #334155; border-radius: 4px; cursor: pointer;
      &.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
    }
    .arrow { background: transparent; border: 1px solid #334155; color: #94a3b8; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; }
  }
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
}

.perm-modal {
  width: 800px; background: #0f172a; border: 1px solid #334155; border-radius: 12px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);

  .modal-header {
    padding: 15px 20px; background: #1e293b; display: flex; justify-content: space-between; align-items: center;
    .title { font-weight: bold; color: #38bdf8; }
    .header-btns { display: flex; gap: 10px; .icon-btn, .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 18px; } }
  }

  .modal-body {
    padding: 24px; overflow-y: auto; max-height: 70vh;
    display: flex; flex-direction: column; gap: 20px;

    .form-item {
      display: flex; flex-direction: column; gap: 8px;
      .label { font-size: 13px; color: #94a3b8; }
      input { background: rgba(0,0,0,0.3); border: 1px solid #334155; color: #fff; padding: 8px 12px; border-radius: 4px; outline: none; &:focus { border-color: #38bdf8; } }
      &.row { flex-direction: row; align-items: center; gap: 20px; }
      .radio-group { display: flex; gap: 20px; label { display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; } }
    }

    .perm-config-area {
      display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
      .config-section {
        background: rgba(0,0,0,0.2); border: 1px solid #334155; border-radius: 8px; padding: 15px;
        display: flex; flex-direction: column; gap: 12px;

        .section-header {
          display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 8px;
          .title { font-size: 14px; font-weight: bold; color: #e2e8f0; }
          .switch-item { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #94a3b8; }
        }

        .search-input input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 4px; font-size: 12px; }

        .tree-box {
          height: 300px; overflow-y: auto; padding-right: 5px;
          .tree-item {
            font-size: 13px; color: #e2e8f0; padding: 4px 0;
            input[type="checkbox"] { margin-right: 8px; }
            &.active { color: #38bdf8; }
            .tree-children { padding-left: 20px; margin-top: 4px; }
            .tree-node { font-size: 10px; margin-right: 5px; cursor: pointer; color: #64748b; }
          }
        }
      }
    }

    .switch {
      width: 32px; height: 16px; background: #334155; border-radius: 10px; position: relative; cursor: pointer;
      &::after { content: ''; position: absolute; left: 2px; top: 2px; width: 12px; height: 12px; background: #fff; border-radius: 50%; transition: 0.2s; }
      &.on { background: #3b82f6; &::after { left: 18px; } }
    }
  }

  .modal-footer {
    padding: 15px 24px; background: #1e293b; display: flex; justify-content: flex-end; gap: 12px;
    button { padding: 8px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .confirm-btn { background: #3b82f6; color: #fff; border: none; &:hover { background: #2563eb; } }
    .cancel-btn { background: transparent; color: #94a3b8; border: 1px solid #334155; &:hover { color: #fff; border-color: #94a3b8; } }
  }
}
</style>
