---
- hosts: localhost
  remote_user: ubuntu
  become: yes
  become_method: sudo
  tasks:
  - git:
      repo: 'https://github.com/eabdul1127/dnscap.git'
      dest: /home/ubuntu/dnscap
  - name: install nodejs ppa
    shell: curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  - name: install nodejs and npm
    apt:
      update_cache: yes
      name: nodejs
  - lineinfile:
      file: /etc/dnspcap.js
      line: 'secret_key="Compassys"'
      regexp: '^secret_key'
      create: yes
  - file: permission=600 file=/etc/dnspcap.js
  - name: install libpcap-dev
    apt:
      update_cache: yes
      name: "{{ item }}"
    with_items:
      - libpcap-dev
      - git
  - name: Install node.js packages
    npm:
      path: /home/ubuntu/dnscap
  
