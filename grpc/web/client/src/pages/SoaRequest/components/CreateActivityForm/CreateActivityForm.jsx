import React, {Component} from 'react';
import IceContainer from '@icedesign/container';
import {
  Input,
  Button,
  Checkbox,
  Select,
  DatePicker,
  Radio,
  Grid,
  Form,
} from '@alifd/next';
import axios from 'axios';


const preUrl = "http://10.111.71.104:7919";
//const preUrl = "http://localhost:7919";
const {Row, Col} = Grid;

// FormBinder 用于获取表单组件的数据，通过标准受控 API value 和 onChange 来双向操作数据
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;

const demoResp = "{}";

const demoReq = "{\n" +
  "  \"arg0\": {\n" +
  "    \"token\": \"190ad0e855024c2690f3c3459beb4261\",\n" +
  "    \"executorGuids\": [],\n" +
  "    \"manageFlag\": false,\n" +
  "    \"pageSize\": 20,\n" +
  "    \"queryGridGapFlag\": false,\n" +
  "    \"_ip\": \"223.104.5.222\",\n" +
  "    \"action\": \"taskCenter.bos.getTaskListForApp\",\n" +
  "    \"version\": \"3.48.0\",\n" +
  "    \"cityGuid\": \"268baf80921949908e5960d9a11f0f08\",\n" +
  "    \"pageIndex\": 1,\n" +
  "    \"taskStatus\": 20,\n" +
  "    \"taskType\": \"idle_spot\",\n" +
  "    \"loginUser\": {\n" +
  "      \"domainCityName\": \"上海市\",\n" +
  "      \"clientId\": \"01701720000013140843\",\n" +
  "      \"realName\": \"王帆\",\n" +
  "      \"guid\": \"2491d5160a38428a8031e8c1148ce129\",\n" +
  "      \"userJobProperties\": 0,\n" +
  "      \"domainCityGuid\": \"268baf80921949908e5960d9a11f0f08\",\n" +
  "      \"businessType\": 0,\n" +
  "      \"userName\": \"王帆\",\n" +
  "      \"userPhone\": \"15522678780\"\n" +
  "    }\n" +
  "  }\n" +
  "}";

const demoAppName = "AppBosTaskApiService";

const demoMethod = "findTaskListForApp";

const formItemLayout = {
  labelCol: {xxs: "6", s: "3", l: "3",},
  wrapperCol: {s: "12", l: "10",}
};

export default class CreateActivityForm extends Component {
  static displayName = 'CreateActivityForm';

  static defaultProps = {};

  componentDidMount() {
    this.getData({env: 'dev', appName: 'AppBosTaskApiService'});
    this.getIfaceData({env: 'dev', appName: 'AppBosTaskApiService'});
    this.getEnvList({});
    console.log('componentWillMount-', this.state);

  }

  getShowData() {
    console.log("==>getShowData begin")
    let env = this.state.value.env;
    let appName = this.state.value.appName;
    //alert(env+"||"+appName);
    this.getData({env: env, appName: appName});
    this.getIfaceData({env: env, appName: appName});
    console.log('<==getShowData end', this.state);

  }

  /**
   * 获取IP列表 第一次加载
   * @param params
   */
  getData(params) {
    axios({
      method: 'get',
      url: preUrl + '/soa/query/provider/list',
      params,
    }).then(response => {

        let data = response.data;
        console.log("==>getData response data = " + JSON.stringify(data));

        const ipList = data.map(item => ({
          label: item.name, value: item.name
        }));
        console.log("==>getData response ipList = " + JSON.stringify(ipList));

        this.setState({"ipList": ipList});
        //this.state.ipList = ipList;
    });
  }

  /**
   * 加载环境下拉框选项
   * @param params
   */
  getEnvList(params) {
    axios({
      method: 'get',
      url: preUrl + '/soa/query/env/list',
      params,
    }).then(response => {

      let resList = response.data;
      if (resList.length > 0) {
        let envList = new Array(resList.length)
        resList.map((item, i) => {
          envList.push({id: item, name: item});
        })
        this.setState({"envList": envList});
      } else {
        this.setState({"envList": []});

      }
    });
  }

  /**
   * 加载iface列表-首次
   * @param params
   */
  getIfaceData(params) {
    axios({
      method: 'get',
      url: preUrl + '/soa/query/iface/list',
      params,
    }).then(response => {

      let data = response.data;
      console.log("==>getIfaceData response data = " + JSON.stringify(data));

      const ifaceList = data.map(item => ({
        label: item.name, value: item.name
      }));
      console.log("==>getIfaceData response ipList = " + JSON.stringify(ifaceList));

      this.setState({"ifaceList": ifaceList});
      //this.state.ipList = ipList;
    });
  }

  /**
   * 请求invoke信息
   */
  postSoaRequest() {
    let params = this.state.value;
    axios({
      method: 'post',
      url: preUrl + '/soa/op/call',
      data: params,
    }).then(response => {

      let data = response.data;
      console.log("==>postSoaRequest response data = " + JSON.stringify(data));

      if (data.code == 'success') {
        console.log("==>postSoaRequest code == success");

        this.setState({"responseJson": JSON.stringify(data)});
        //this.state.ipList = ipList;
      } else {
        this.setState({"responseJson": JSON.stringify(data)});
        console.log("==>postSoaRequest state.responseJson = " + JSON.stringify(this.state.responseJson));

      }
    }).catch(error => {
      console.log("==>postSoaRequest error begin")
      console.log("--->data:" + JSON.stringify(error))
      console.log("==>postSoaRequest error end")

    });
  }

  /**
   * 检索相关的key，ipList，模糊查询
   * @param value
   */
  handleSearchIpList = (value) => {
    let params = {env: this.state.value.env, appName: this.state.value.appName, key: value};
    axios({
      method: 'get',
      url: preUrl + '/soa/query/provider/search',
      params,
    }).then(response => {

      let data = response.data;
      console.log("==>handleSearchIpList response data = " + JSON.stringify(data));

      const ipList = data.map(item => ({
        label: item.name, value: item.name
      }));
      console.log("==>handleSearchIpList response ipList = " + JSON.stringify(ipList));

      this.setState({"ipList": ipList});
      //this.state.ipList = ipList;
    });
  }
  /**
   * 检索相关的key，ifaceList，模糊查询
   * @param value
   */
  handleSearchIfaceList = (value) => {
    let params = {env: this.state.value.env, appName: this.state.value.appName, key: value};
    axios({
      method: 'get',
      url: preUrl + '/soa/query/iface/search',
      params,
    }).then(response => {

      let data = response.data;
      console.log("==>handleSearchIpList response data = " + JSON.stringify(data));

      const ifaceList = data.map(item => ({
        label: item.name, value: item.name
      }));
      console.log("==>handleSearchIpList response ifaceList = " + JSON.stringify(ifaceList));

      this.setState({"ifaceList": ifaceList});
      //this.state.ipList = ipList;
    });
  }
  /**
   * 加载模糊搜索APPNAME
   *
   * @param value
   */
  handleSearch = (value) => {
    axios({
      method: 'get',
      url: preUrl + '/soa/query/app/search?env=' + this.state.value.env + "&key=" + value,
    }).then(response => {

      let data = response.data;
      console.log("==>handleSearch response data = " + JSON.stringify(data));
      const dataSource = data.map(item => ({
        label: item, value: item
      }));
      console.log("==>handleSearch response dataSource = " + JSON.stringify(dataSource));
      this.setState({"appDataSource": dataSource});

    }).catch(error => {
      console.log("==>handleSearch error begin")
      console.log("--->data:" + JSON.stringify(error))
      console.log("==>handleSearch error end")

    });
  }

  constructor(props) {
    super(props);
    this.state = {
      appDataSource: [],
      ipList: [],
      ifaceList: [],
      envList: [],
      value: {
        env: 'dev',
        appName: '',
        iface: '',
        method: '',
        requestJson: '',
        responseJson: '{}'
      },
    };
  }

  onFormChange = (value) => {
    this.setState({
      value,
    });
  };

  reset = () => {

  };

  submit = (value, error) => {
    console.log('error', error, 'value', value);
    if (error) {
      // 处理表单报错
    }
    // 提交当前填写的数据
  };

  render() {

    let envList = this.state.envList;
    //alert(JSON.stringify(ipList));


    return (
      <div className="create-activity-form">
        <IceContainer title="SOA泛化请求" style={styles.container}>
          <Form
            value={this.state.value}
            onChange={this.onFormChange}
          >
            {/**/}

            <FormItem {...formItemLayout} label="AppName："
                      required
                      requiredMessage="请输入应用名称"
                      help={"demo:" + demoAppName}
            >

              <Select showSearch
                      name="appName"
                      placeholder={demoAppName}
                      filterLocal={false}
                      dataSource={this.state.appDataSource}
                      onSearch={this.handleSearch}
                      style={{width: '100%'}}/>


            </FormItem>

            <FormItem {...formItemLayout} label="Env："
            >
              <Select
                name="env"
                style={{width: '50%'}}
              >
                {envList.length > 0 &&
                envList.map((item, i) => {
                  return (
                    <option key={i} value={item.id}>
                      {item.name}
                    </option>
                  );
                })}
              </Select>
              &nbsp;&nbsp;
              <Button type="primary" onClick={() => {
                this.getShowData();
              }}>
                查询
              </Button>
            </FormItem>

            <FormItem {...formItemLayout} label="Ip/Port："
                      required
                      requiredMessage="服务地址必须选择"
            >
              <Select showSearch
                        name="ipPort"
                        filterLocal={false}
                        dataSource={this.state.ipList}
                        onSearch={this.handleSearchIpList}
                        style={{width: '100%'}}/>
            </FormItem>

            <FormItem {...formItemLayout} label="Iface："
                      required
                      requiredMessage="接口名称必须选择"
            >
              <Select
                name="iface"
                showSearch
                filterLocal={false}
                dataSource={this.state.ifaceList}
                onSearch={this.handleSearchIfaceList}
                style={{width: '100%'}}
              />
            </FormItem>

            <FormItem {...formItemLayout} label="Method："
                      required
                      requiredMessage="方法名称必须填写"
                      help={"demo:" + demoMethod}
            >
              <Input name="method" style={{width: '100%'}} placeholder={demoMethod}/>
            </FormItem>


            <FormItem {...formItemLayout} label="RequestJson："
            >
              <Input.TextArea name="requestJson" style={{width: '100%'}} autoHeight={{minRows: 15, maxRows: 30}}
                              placeholder={demoReq}/>
            </FormItem>

            <FormItem {...formItemLayout} label=" ">
              <Button type="primary" onClick={() => {
                this.postSoaRequest();
              }}>
                立即执行
              </Button>
              <Form.Reset style={styles.resetBtn} onClick={this.reset}>
                重置
              </Form.Reset>
            </FormItem>


          </Form>
        </IceContainer>
        <IceContainer title="执行结果" style={styles.container}>
          <FormItem {...formItemLayout} label="ResponseJson：">
            <Input.TextArea name="responseJson" style={{width: '100%'}} autoHeight={{minRows: 15, maxRows: 30}}
                            placeholder={demoResp}
                            value={this.state.responseJson}
            />
          </FormItem>
        </IceContainer>
      </div>
    );
  }


}

const styles = {
  container: {
    paddingBottom: 0,
  },
  formItem: {
    height: '28px',
    lineHeight: '28px',
    marginBottom: '25px',
  },
  formLabel: {
    textAlign: 'right',
  },
  btns: {
    margin: '25px 0',
  },
  resetBtn: {
    marginLeft: '20px',
  },
};
