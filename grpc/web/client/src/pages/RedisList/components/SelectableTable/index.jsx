import React, {Component} from 'react';
import {Table, Button, Icon, Pagination, Form, Input} from '@alifd/next';
import IceContainer from '@icedesign/container';
import styles from './index.module.scss';
import axios from "axios";


const preUrl = "http://10.111.71.104:7919";

const FormItem = Form.Item;

// 注意：下载数据的功能，强烈推荐通过接口实现数据输出，并下载
// 因为这样可以有下载鉴权和日志记录，包括当前能不能下载，以及谁下载了什么

export default class SelectableTable extends Component {
  static displayName = 'SelectableTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);

    // 表格可以勾选配置项
    this.rowSelection = {
      // 表格发生勾选状态变化时触发
      onChange: (ids) => {
        console.log('ids', ids);
        let arr = [];
        for(let i = 0; i < ids.length; i++){
          let id = ids[i];
          let entity = this.getEntityById(id);
          arr.push(entity);
        }
        this.setState({
          selectedRowKeys: ids,
          selectRecords: arr
        });
      },
      // 全选表格时触发的回调
      onSelectAll: (selected, records) => {
        console.log('onSelectAll', selected, records);
        this.setState({"selectRecords": records});
      },
      // 支持针对特殊行进行定制
      getProps: (record) => {
        return {
          disabled: record.id === 100306660941,
        };
      },
    };

    this.state = {
      selectedRowKeys: [],
      selectRecords: [],
      dataSource: [],
      value: {
        host: '10.111.10.63',
        port: 8443,
        pwd: 'test',
        db: 1,
        match: '*',
        curr: 0,
        limit: 100
      }
    };
  }

  componentDidMount() {
    this.getGridData();
  }

  getGridData = () => {
    const result = [];
    let params = this.buildFormValue();
    axios({
      method: 'post',
      url: preUrl + '/redis/scan/list',
      data: params,
    }).then(response => {

      let data = response.data;
      console.log("==>getData response data = " + JSON.stringify(data));
      for (let i = 0; i < data.length; i++) {
        result.push({
          id: i + 1,
          key: data[i],
          value: '*****'
        });
      }

      this.setState({"dataSource": result});
    });
  }

  buildFormValue(){
    return {
      "host": this.state.value.host,
      "port": this.state.value.port,
      "pwd": this.state.value.pwd,
      "db": this.state.value.db,
      "match": this.state.value.match,
      "curr":this.state.value.curr,
      "limit":this.state.value.limit
    };
  }

  clearSelectedKeys = () => {
    //alert(JSON.stringify(this.state.selectedRowKeys));
    this.setState({
      selectedRowKeys: [],
      selectRecords:[]
    });
  };

  deleteSelectedKeys = () => {
    let keys = this.getRecordKeys();
    console.log('delete keys', keys);
    let redisReq = this.buildFormValue();
    let params = {
      "redisReq": redisReq, "keys": keys
    }
    axios({
      method: 'post',
      url: preUrl + '/redis/op/del',
      data: params,
    }).then(response => {

      let data = response.data;
      console.log("==>deleteSelectedKeys response data = " + JSON.stringify(data));
      if (data == 'success') {
        this.getGridData();
        this.clearSelectedKeys();
      }
    });
  };

  getRecordKeys() {
    let result = this.state.selectRecords.map(item => (item.key));
    return result;
  }

  deleteItem = (record) => {
    const {id} = record;
    let key = this.getKeyById(id);
    let redisReq = this.buildFormValue();
    let keys = [];
    keys.push(key);
    let params = {
      "redisReq": redisReq, "keys": keys
    }
    axios({
      method: 'post',
      url: preUrl + '/redis/op/del',
      data: params,
    }).then(response => {

      let data = response.data;
      console.log("==>delItem response data = " + JSON.stringify(data));
      if (data == 'success') {
        this.getGridData();
      }
    });
    console.log('delete item', id);
  };

  getItemValue = (record) => {
    const {id} = record;
    let key = this.getKeyById(id);
    //alert(key);
    let redisReq = this.buildFormValue();
    let keys = [];
    keys.push(key);
    let params = {
      "redisReq": redisReq, "keys": keys
    }
    axios({
      method: 'post',
      url: preUrl + '/redis/get/one',
      data: params,
    }).then(response => {

      let data = response.data;
      console.log("==>getData response data = " + JSON.stringify(data));
      const result = [];
      for (let i = 0; i < this.state.dataSource.length; i++) {
        let entity = this.state.dataSource[i];
        //console.log("id:",id);
        //console.log("entity:",JSON.stringify(entity));
        //console.log("entity = ",JSON.stringify(entity));
        /*if("powerBikeAddMarkPos:2100465904"==entity.key){
          console.log("entity = ",JSON.stringify(entity));
          console.log("entity equals = ",entity.key == data.key);
        }*/
        if (entity.key == data[0].key) {
          entity.value = JSON.stringify(data[0].value);
        }
        result.push({
          id: entity.id,
          key: entity.key,
          value: entity.value
        });
      }

      this.setState({"dataSource": result});
    });
  }

  getKeyById(id) {
    for (let i = 0; i < this.state.dataSource.length; i++) {
      let entity = this.state.dataSource[i];
      //console.log("id:",id);
      //console.log("entity:",JSON.stringify(entity));
      if (entity.id == id) {
        return entity.key;
      }
    }
  }

  getEntityById(id) {
    for (let i = 0; i < this.state.dataSource.length; i++) {
      let entity = this.state.dataSource[i];
      //console.log("id:",id);
      //console.log("entity:",JSON.stringify(entity));
      if (entity.id == id) {
        return entity;
      }
    }
  }

  renderOperator = (value, index, record) => {
    return (
      <div>
        <a
          onClick={this.getItemValue.bind(this, record)}
        >取值</a>
        <a
          className={styles.removeBtn}
          onClick={this.deleteItem.bind(this, record)}
        >
          删除
        </a>
      </div>
    );
  };

  onFormChange = (value) => {
    this.setState({
      value,
    });
  };

  reset = () => {

  };

  render() {
    return (
      <div className={`${styles.selectableTable} selectable-table`}>
        <IceContainer className={styles.IceContainer}>
          <Form inline value={this.state.value} onChange={this.onFormChange}>
            <FormItem label="host："
                      required
                      requiredMessage="host必填"
                      help={"demo:10.111.10.63"}
            >
              <Input name="host" style={{width: '80'}}/>
            </FormItem>
            <FormItem label="port："
                      required
                      requiredMessage="port必填"
                      help={"demo:8443"}
            >
              <Input name="port" style={{width: '80'}}/>
            </FormItem>
            <FormItem label="pwd："
                      required
                      requiredMessage="pwd必填"
                      help={"demo:test"}
            >
              <Input name="pwd" style={{width: '80'}}/>
            </FormItem>
            <FormItem label="db："
                      required
                      requiredMessage="db必填"
                      help={"demo: 1"}
            >
              <Input name="db" style={{width: '80'}}/>
            </FormItem>
            <FormItem label="match："
                      help={"demo: *"}
            >
              <Input name="match" style={{width: '80'}}/>
            </FormItem>
            <FormItem label="curr："
                      help={"demo: 0"}
            >
              <Input name="curr" style={{width: '80'}}/>
            </FormItem>
            <FormItem label="limit："
                      help={"demo: 1"}
            >
              <Input name="limit" style={{width: '80'}}/>
            </FormItem>
            <FormItem label=" ">
              <Button type="primary" onClick={() => {
                this.getGridData();
              }}>
                查询
              </Button>
              &nbsp;&nbsp;
              <Form.Reset type="primary" onClick={this.reset}>
                重置
              </Form.Reset>
            </FormItem>
          </Form>
        </IceContainer>
        <IceContainer className={styles.IceContainer}>
          <div>
            {/*<Button size="small" className={styles.batchBtn}>
              <Icon type="add"/>增加
            </Button>
            */}<Button
            onClick={this.deleteSelectedKeys}
            size="small"
            className={styles.batchBtn}
            disabled={!this.state.selectedRowKeys.length}
          >
            <Icon type="ashbin"/>删除
          </Button>
            <Button
              onClick={this.clearSelectedKeys}
              size="small"
              className={styles.batchBtn}
            >
              <Icon type="close"/>清空选中
            </Button>
          </div>
          {/* <div>
            <a href="/" download>
              <Icon size="small" type="download" /> 导出表格数据到 .csv 文件
            </a>
          </div>*/}
        </IceContainer>
        <IceContainer>
          <Table
            dataSource={this.state.dataSource}
            loading={this.state.isLoading}
            rowSelection={{
              ...this.rowSelection,
              selectedRowKeys: this.state.selectedRowKeys,
            }}
          >
            <Table.Column title="id" dataIndex="id" width={'15%'}/>
            <Table.Column title="key" dataIndex="key" width={'40%'}/>
            <Table.Column title="value" dataIndex="value" width={'45%'}/>
            <Table.Column
              title="操作"
              cell={this.renderOperator}
              lock="right"
              width={120}
            />
          </Table>
          <div className={styles.pagination}>
            <Pagination onChange={this.change}/>
          </div>
        </IceContainer>
      </div>
    );
  }


}


