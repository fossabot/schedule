import React from 'react';
import TabsWeekDays from './TabsWeekDays';
import moment from 'moment';
import { Spin } from 'antd';
import SelectGroup from '../SelectGroup';
const api = require('../api');

class Schedule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trimester: {},
      schedule: {},
      loading: false,
      week_number: 1,
      week_total: 0,
    };
  }
  loadSchedule = async () => {
    localStorage.setItem('groupId', this.props.match.params.groupId);
    localStorage.setItem('facultyId', this.props.match.params.facultyId);
    this.setState({ loading: true });
    try {
      let res = await api.getTrimester();
      let trimester = res.data;
      trimester.dateStart = moment(trimester.dateStart);
      trimester.dateFinish = moment(trimester.dateFinish);
      let week_number =
        moment().diff(trimester.dateStart.startOf('week'), 'week') + 1;
      let week_total = trimester.dateFinish.diff(trimester.dateStart, 'week');
      const groupId = this.props.match.params.groupId;
      res = await api.getSchedule(groupId, trimester.IdTrimester);
      let schedule = res.data;
      this.setState({
        trimester,
        schedule,
        loading: false,
        week_number,
        week_total,
      });
    } catch (error) {
      console.log(error);
      this.setState({ loading: false });
    }
  };

  componentDidMount = () => {
    this.loadSchedule();
  };

  handleGroupChange = (value, selectedOptions) => {
    let [facultyId, groupId] = value;
    this.props.history.push(`/${facultyId}/${groupId}`);
    this.loadSchedule();
  };

  render() {
    console.log('Component `Schedule` props =', this.props);
    const { groupId, facultyId } = this.props.match.params;
    return (
      <div>
        <SelectGroup
          facultyId={facultyId}
          groupId={groupId}
          onChange={this.handleGroupChange}
        />
        {this.state.schedule.length > 0 ? (
          <TabsWeekDays
            schedule={this.state.schedule}
            week_number={this.state.week_number}
            week_total={this.state.week_total}
          />
        ) : (
          <Spin />
        )}
      </div>
    );
  }
}

export default Schedule;
