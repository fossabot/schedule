import React from 'react';
import TabsWeekDays, { ILessonOld } from './TabsWeekDays';
import moment from 'moment';
import { Spin, message } from 'antd';
import SelectGroup from '../SelectGroup';
import api from '../api';
import plamyaModal from './plamyaModal';

type ScheduleProps = any;

interface ScheduleState {}

class Schedule extends React.Component<ScheduleProps, ScheduleState> {
  state = {
    trimester: {},
    schedule: [],
    loading: false,
    week_number: 1,
    week_total: 0,
  };

  constructor(props: ScheduleProps) {
    super(props);
    console.log('Schedule constructor');
  }

  loadSchedule = async () => {
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
      const facultyId = this.props.match.params.facultyId;
      localStorage.setItem('groupId', groupId);
      localStorage.setItem('facultyId', facultyId);

      res = await api.getSchedule(groupId, trimester.IdTrimester);
      let schedule: ILessonOld[] = res.data;
      this.setState({
        trimester,
        schedule,
        loading: false,
        week_number,
        week_total,
      });
    } catch (error) {
      this.setState({ loading: false, schedule: [] });
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        message.error('Нет соединения');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
    }
  };

  componentDidMount = () => {
    this.loadSchedule();
    setTimeout(plamyaModal, 3000);
  };

  componentWillReceiveProps = () => {
    // это нужно чтобы расписание обновилось, когда изменится группа чрез каскадер
    // т.к. компонент при этом не перемонтируется и componentDidMount не вызывается
    this.loadSchedule();
  };

  handleGroupChange = (value: string[], selectedOptions?: any) => {
    let [facultyId, groupId] = value;
    const url = `/${facultyId}/${groupId}`;
    this.props.history.push(url);
  };

  render() {
    // console.log('Component `Schedule` props =', this.props);
    const { groupId, facultyId } = this.props.match.params;
    return (
      <div>
        <SelectGroup
          facultyId={facultyId}
          groupId={groupId}
          onChange={this.handleGroupChange}
        />
        {this.state.loading ? (
          <Spin />
        ) : (
          <TabsWeekDays
            schedule={this.state.schedule}
            week_number={this.state.week_number}
            week_total={this.state.week_total}
          />
        )}
      </div>
    );
  }
}

export default Schedule;
