import React, { Component } from 'react';
import SelectableTable from './components/SelectableTable';

export default class RedisList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="redis-list-page">
        {/* 可批量操作的表格 */}
        <SelectableTable />
      </div>
    );
  }
}
