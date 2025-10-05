// ============================================
// OFFICER LAYOUT COMPONENT
// ============================================

import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

interface NavGroup {
  label: string;
  icon: string;
  expanded?: boolean;
  items?: NavItem[];
  route?: string;
  badge?: number;
  color?: string;
}

interface NavItem {
  label: string;
  route: string;
  icon?: string;
  badge?: number;
  color?: string;
}

@Component({
  selector: 'app-officer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  standalone: true,
  template: `
    <div class="officer-layout">
      
      <!-- Top Navbar -->
      <nav class="top-navbar">
        <div class="navbar-content">
          
          <!-- Left: Brand + Sidebar Toggle -->
          <div class="navbar-left">
            <button class="sidebar-toggle" (click)="toggleSidebar()" title="Toggle sidebar">
              <span class="toggle-icon">{{ isSidebarOpen ? '✕' : '☰' }}</span>
            </button>
            
            <a class="brand-link" [routerLink]="['/officer/dashboard']">
              <div class="brand-icon">
                <span class="icon-text">👨‍💼</span>
              </div>
              <div class="brand-content">
                <span class="brand-title">Officer Panel</span>
                <span class="brand-subtitle">Loan Management</span>
              </div>
            </a>
          </div>

          <!-- Right: Actions -->
          <div class="navbar-right">
            
            <!-- Search -->
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Search..." class="search-input" />
            </div>

            <!-- Notifications -->
            <div class="action-item" (click)="toggleNotifications()">
              <button class="action-btn">
                <span class="action-icon">🔔</span>
                @if (unreadCount > 0) {
                  <span class="notification-badge">{{ unreadCount }}</span>
                }
              </button>
              
              @if (showNotifications) {
                <div class="notifications-dropdown" (click)="$event.stopPropagation()">
                  <div class="dropdown-header">
                    <h6 class="dropdown-title">Notifications</h6>
                    <button class="mark-all-read" (click)="markAllAsRead()">Mark all read</button>
                  </div>
                  <div class="notifications-list">
                    @if (notifications.length === 0) {
                      <div class="empty-state">
                        <span class="empty-icon">✨</span>
                        <p>All caught up!</p>
                      </div>
                    } @else {
                      @for (notif of notifications.slice(0, 5); track notif.id) {
                        <div class="notification-item" [class.unread]="!notif.read">
                          <div class="notif-icon" [style.background]="notif.color">
                            {{ notif.icon }}
                          </div>
                          <div class="notif-content">
                            <p class="notif-message">{{ notif.message }}</p>
                            <span class="notif-time">{{ notif.time }}</span>
                          </div>
                          @if (!notif.read) {
                            <span class="unread-dot"></span>
                          }
                        </div>
                      }
                      <a [routerLink]="['/user/notifications']" class="view-all-link" (click)="closeNotifications()">
                        View All Notifications →
                      </a>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Quick Actions -->
            <div class="action-item">
              <button class="action-btn" (click)="toggleQuickActions()" title="Quick actions">
                <span class="action-icon">⚡</span>
              </button>
              
              @if (showQuickActions) {
                <div class="quick-actions-dropdown" (click)="$event.stopPropagation()">
                  <div class="dropdown-header">
                    <h6 class="dropdown-title">Quick Actions</h6>
                  </div>
                  <div class="actions-grid">
                    <a [routerLink]="['/officer/assigned-applications']" class="action-card" (click)="closeQuickActions()">
                      <span class="card-icon">📋</span>
                      <span class="card-label">Applications</span>
                    </a>
                    <a [routerLink]="['/officer/loan-approvals']" class="action-card" (click)="closeQuickActions()">
                      <span class="card-icon">✅</span>
                      <span class="card-label">Approvals</span>
                    </a>
                    <a [routerLink]="['/officer/document-verification']" class="action-card" (click)="closeQuickActions()">
                      <span class="card-icon">📄</span>
                      <span class="card-label">Verify Docs</span>
                    </a>
                    <a [routerLink]="['/officer/customers']" class="action-card" (click)="closeQuickActions()">
                      <span class="card-icon">👥</span>
                      <span class="card-label">Customers</span>
                    </a>
                  </div>
                </div>
              }
            </div>

            <!-- Profile -->
            <div class="action-item profile-item" (click)="toggleProfileMenu()">
              <button class="profile-btn">
                <div class="profile-avatar">
                  <span>{{ getInitials() }}</span>
                </div>
                <span class="profile-arrow" [class.rotated]="showProfileMenu">▼</span>
              </button>

              @if (showProfileMenu) {
                <div class="profile-dropdown" (click)="$event.stopPropagation()">
                  <div class="profile-dropdown-header">
                    <div class="profile-avatar-large">
                      <span>{{ getInitials() }}</span>
                    </div>
                    <div class="profile-details">
                      <h6 class="profile-dropdown-name">{{ authService.getUserName() }}</h6>
                      <p class="profile-dropdown-email">Loan Officer</p>
                    </div>
                  </div>
                  
                  <div class="profile-dropdown-menu">
                    <a [routerLink]="['/officer/profile']" class="dropdown-link" (click)="closeProfileMenu()">
                      <span class="link-icon">👤</span>
                      <span class="link-text">My Profile</span>
                    </a>
                    <a [routerLink]="['/officer/settings']" class="dropdown-link" (click)="closeProfileMenu()">
                      <span class="link-icon">⚙️</span>
                      <span class="link-text">Settings</span>
                    </a>
                    <a [routerLink]="['/officer/performance']" class="dropdown-link" (click)="closeProfileMenu()">
                      <span class="link-icon">📊</span>
                      <span class="link-text">Performance</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="javascript:void(0)" class="dropdown-link logout-link" (click)="logout()">
                      <span class="link-icon">🚪</span>
                      <span class="link-text">Logout</span>
                    </a>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </nav>

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="isSidebarOpen">
        <div class="sidebar-content">
          
          <!-- Navigation Menu -->
          <nav class="sidebar-nav">
            @for (group of navGroups; track group.label) {
              <div class="nav-group">
                
                <!-- Group with submenu -->
                @if (group.items && group.items.length > 0) {
                  <button 
                    class="nav-group-header" 
                    (click)="toggleGroup(group)"
                    [class.expanded]="group.expanded"
                  >
                    <span class="nav-icon">{{ group.icon }}</span>
                    <span class="nav-label">{{ group.label }}</span>
                    @if (group.badge) {
                      <span class="nav-badge" [style.background]="group.color">{{ group.badge }}</span>
                    }
                    <span class="expand-icon" [class.rotated]="group.expanded">›</span>
                  </button>
                  
                  <div class="nav-submenu" [class.expanded]="group.expanded">
                    @for (item of group.items; track item.route) {
                      <a 
                        class="nav-subitem" 
                        [routerLink]="[item.route]"
                        routerLinkActive="active"
                        (click)="handleNavClick()"
                      >
                        @if (item.icon) {
                          <span class="subitem-icon">{{ item.icon }}</span>
                        }
                        <span class="subitem-label">{{ item.label }}</span>
                        @if (item.badge) {
                          <span class="subitem-badge" [style.background]="item.color">{{ item.badge }}</span>
                        }
                      </a>
                    }
                  </div>
                }
                
                <!-- Single item (no submenu) -->
                @else {
                  <a 
                    class="nav-group-header nav-single-item" 
                    [routerLink]="[group.route]"
                    routerLinkActive="active"
                    (click)="handleNavClick()"
                  >
                    <span class="nav-icon">{{ group.icon }}</span>
                    <span class="nav-label">{{ group.label }}</span>
                    @if (group.badge) {
                      <span class="nav-badge" [style.background]="group.color">{{ group.badge }}</span>
                    }
                  </a>
                }
              </div>
            }
          </nav>

          <!-- Sidebar Footer -->
          <div class="sidebar-footer">
            <div class="footer-info">
              <span class="footer-icon">📊</span>
              <div class="footer-text">
                <p class="footer-title">Performance</p>
                <p class="footer-subtitle">View your stats</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content" [class.sidebar-open]="isSidebarOpen">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Backdrop for mobile sidebar -->
      @if (isSidebarOpen && isMobile) {
        <div class="backdrop" (click)="closeSidebar()"></div>
      }

      <!-- Dropdown Overlay -->
      @if (showNotifications || showQuickActions || showProfileMenu) {
        <div class="dropdown-overlay" (click)="closeAllDropdowns()"></div>
      }
    </div>
  `,
  styles: [`
    .officer-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8fafc;
    }

    .top-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    .navbar-content {
      height: 100%;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-toggle {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      font-size: 1.3rem;
    }

    .sidebar-toggle:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(1.05);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
    }

    .icon-text {
      font-size: 1.3rem;
    }

    .brand-content {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      color: white;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .brand-subtitle {
      color: #94a3b8;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .search-box:focus-within {
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3);
    }

    .search-icon {
      font-size: 1rem;
      color: #94a3b8;
    }

    .search-input {
      background: transparent;
      border: none;
      color: white;
      outline: none;
      width: 200px;
      font-size: 0.9rem;
    }

    .search-input::placeholder {
      color: #94a3b8;
    }

    .action-item {
      position: relative;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: scale(1.05);
    }

    .action-icon {
      font-size: 1.2rem;
    }

    .notification-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 10px;
      border: 2px solid #0f766e;
      min-width: 18px;
      text-align: center;
    }

    .profile-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .profile-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .profile-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .profile-arrow {
      color: #94a3b8;
      font-size: 0.7rem;
      transition: transform 0.3s ease;
    }

    .profile-arrow.rotated {
      transform: rotate(180deg);
    }

    .sidebar {
      position: fixed;
      top: 64px;
      left: 0;
      bottom: 0;
      width: 280px;
      background: white;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease;
      z-index: 999;
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .nav-group {
      margin-bottom: 0.25rem;
    }

    .nav-group-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: transparent;
      border: none;
      color: #4b5563;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      text-decoration: none;
    }

    .nav-group-header:hover {
      background: #f9fafb;
      color: #14b8a6;
    }

    .nav-group-header.active,
    .nav-single-item.active {
      background: linear-gradient(90deg, #ccfbf1 0%, #99f6e4 100%);
      color: #0f766e;
      border-right: 3px solid #14b8a6;
    }

    .nav-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      padding: 0.15rem 0.5rem;
      background: #ef4444;
      color: white;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 20px;
      text-align: center;
    }

    .expand-icon {
      font-size: 1.2rem;
      color: #9ca3af;
      transition: transform 0.3s ease;
      font-weight: bold;
    }

    .expand-icon.rotated {
      transform: rotate(90deg);
    }

    .nav-submenu {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background: #f9fafb;
    }

    .nav-submenu.expanded {
      max-height: 600px;
    }

    .nav-subitem {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 1.25rem 0.65rem 3.25rem;
      color: #6b7280;
      font-size: 0.85rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .nav-subitem:hover {
      background: white;
      color: #14b8a6;
      padding-left: 3.5rem;
    }

    .nav-subitem.active {
      background: white;
      color: #0f766e;
      font-weight: 600;
      border-right: 3px solid #14b8a6;
    }

    .subitem-icon {
      font-size: 1rem;
    }

    .subitem-label {
      flex: 1;
    }

    .subitem-badge {
      padding: 0.1rem 0.4rem;
      background: #ef4444;
      color: white;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 18px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid #e5e7eb;
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .footer-info:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
    }

    .footer-icon {
      font-size: 1.5rem;
    }

    .footer-text {
      flex: 1;
    }

    .footer-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: #0f766e;
      margin: 0 0 0.15rem 0;
    }

    .footer-subtitle {
      font-size: 0.75rem;
      color: #14b8a6;
      margin: 0;
    }

    .main-content {
      margin-top: 64px;
      margin-left: 0;
      transition: margin-left 0.3s ease;
      min-height: calc(100vh - 64px);
    }

    .main-content.sidebar-open {
      margin-left: 280px;
    }

    .content-wrapper {
      padding: 0;
      max-width: 100%;
    }

    /* Dropdowns */
    .notifications-dropdown,
    .quick-actions-dropdown,
    .profile-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      min-width: 320px;
      z-index: 1001;
      animation: dropdownSlide 0.3s ease-out;
    }

    @keyframes dropdownSlide {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dropdown-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .mark-all-read {
      background: none;
      border: none;
      color: #14b8a6;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: #f9fafb;
    }

    .notification-item.unread {
      background: #ccfbf1;
    }

    .notif-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .notif-content {
      flex: 1;
    }

    .notif-message {
      font-size: 0.85rem;
      color: #334155;
      margin: 0 0 0.25rem 0;
    }

    .notif-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: #14b8a6;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 8px;
    }

    .empty-state {
      padding: 3rem 1.25rem;
      text-align: center;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .view-all-link {
      display: block;
      text-align: center;
      padding: 0.75rem;
      color: #14b8a6;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      border-top: 1px solid #e5e7eb;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      padding: 1rem 1.25rem;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .action-card:hover {
      background: #14b8a6;
      transform: translateY(-2px);
    }

    .card-icon {
      font-size: 1.8rem;
    }

    .card-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #334155;
      transition: color 0.2s;
    }

    .action-card:hover .card-label {
      color: white;
    }

    .profile-dropdown-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
      border-radius: 16px 16px 0 0;
    }

    .profile-avatar-large {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .profile-details {
      flex: 1;
    }

    .profile-dropdown-name {
      color: white;
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .profile-dropdown-email {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.8rem;
      margin: 0;
    }

    .profile-dropdown-menu {
      padding: 0.5rem;
    }

    .dropdown-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #334155;
      text-decoration: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .dropdown-link:hover {
      background: #f3f4f6;
      color: #14b8a6;
    }

    .logout-link {
      color: #ef4444;
    }

    .logout-link:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .link-icon {
      font-size: 1.1rem;
    }

    .dropdown-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }

    /* Overlays */
    .backdrop,
    .dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      animation: fadeIn 0.3s ease;
    }

    .dropdown-overlay {
      background: transparent;
      z-index: 999;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Scrollbar */
    .sidebar-nav::-webkit-scrollbar,
    .notifications-list::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track,
    .notifications-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .sidebar-nav::-webkit-scrollbar-thumb,
    .notifications-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .main-content.sidebar-open {
        margin-left: 0;
      }

      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .search-box {
        display: none;
      }

      .brand-content {
        display: none;
      }

      .main-content {
        margin-left: 0 !important;
      }
    }

    @media (max-width: 576px) {
      .navbar-content {
        padding: 0 1rem;
      }

      .search-input {
        width: 150px;
      }
    }
  `]
})
export class OfficerLayout implements OnInit {
  isSidebarOpen = false;
  isMobile = false;
  showNotifications = false;
  showQuickActions = false;
  showProfileMenu = false;

  navGroups: NavGroup[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/officer/dashboard'
    },
    {
      label: 'Applications',
      icon: '📋',
      expanded: false,
      items: [
        { label: 'Assigned Applications', route: '/officer/assigned-applications', icon: '📝' },
        { label: 'Loan Approvals', route: '/officer/loan-approvals', icon: '✅' },
        { label: 'All Applications', route: '/officer/loan-applications', icon: '📄' }
      ]
    },
    {
      label: 'Customers',
      icon: '👥',
      expanded: false,
      items: [
        { label: 'All Customers', route: '/officer/customers', icon: '🧑‍💼' },
        { label: 'Customer Queries', route: '/officer/queries', icon: '❓' }
      ]
    },
    {
      label: 'Documents',
      icon: '📁',
      expanded: false,
      items: [
        { label: 'Document Verification', route: '/officer/document-verification', icon: '✓' },
        { label: 'All Documents', route: '/officer/documents', icon: '📄' },
        { label: 'Assigned Documents', route: '/officer/assigned-applications', icon: '📂' }
      ]
    },
    {
      label: 'Loans',
      icon: '💰',
      expanded: false,
      items: [
        { label: 'Active Loans', route: '/officer/loan-applications', icon: '💵' },
        { label: 'Loan Schemes', route: '/officer/loan-schemes', icon: '📝' },
        { label: 'Repayments', route: '/officer/repayments', icon: '💸' },
      ]
    },
    {
      label: 'Performance',
      icon: '📈',
      expanded: false,
      items: [
        { label: 'My Performance', route: '/officer/performance', icon: '🎯' },
        { label: 'Workload', route: '/officer/workload', icon: '⚖️' },
        { label: 'Summary', route: '/officer/summary', icon: '📊' },
        { label: 'Assignments', route: '/officer/assignments', icon: '📌' }
      ]
    },
    {
      label: 'Reports',
      icon: '📄',
      route: '/officer/generate-report'
    },
    {
      label: 'Settings',
      icon: '⚙️',
      route: '/officer/settings'
    }
  ];

  notifications: any[] = [
    { id: 1, icon: '📋', color: '#dbeafe', message: 'New application assigned to you', time: '10 min ago', read: false },
    { id: 2, icon: '✅', color: '#d1fae5', message: 'Document verified successfully', time: '1 hour ago', read: false },
    { id: 3, icon: '❓', color: '#fef3c7', message: 'New customer query received', time: '2 hours ago', read: true },
  ];

  constructor(
    public authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkMobile();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkMobile());
    }

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-item')) {
        this.closeAllDropdowns();
      }
    });
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth < 1025;
    this.isSidebarOpen = false;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  handleNavClick(): void {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  toggleGroup(group: NavGroup): void {
    if (group.items && group.items.length > 0) {
      group.expanded = !group.expanded;
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showQuickActions = false;
    this.showProfileMenu = false;
  }

  toggleQuickActions(): void {
    this.showQuickActions = !this.showQuickActions;
    this.showNotifications = false;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
    this.showQuickActions = false;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  closeQuickActions(): void {
    this.showQuickActions = false;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  closeAllDropdowns(): void {
    this.showNotifications = false;
    this.showQuickActions = false;
    this.showProfileMenu = false;
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getInitials(): string {
    const name = this.authService.getUserName();
    if (!name) return 'LO';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.closeAllDropdowns();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}