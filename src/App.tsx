import { Icon, LocaleProvider } from 'antd';
import ru_RU from 'antd/lib/locale-provider/ru_RU';
import 'moment/locale/ru';
import React from 'react';
import { Link, Redirect, Route, Router, Switch } from 'react-router-dom';
import ym, { YMInitializer } from 'react-yandex-metrika';
import history from './history';
import { ListFaculties, ListGroups } from './Lists';
import Schedule from './Schedule/Schedule';

/** Detects if device is on iOS */
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};
/** Detects if device is in standalone mode */
const isInStandaloneMode = (): boolean => {
  const nav: any = window.navigator;
  return nav.standalone;
};

class App extends React.Component {
  componentDidMount() {
    if (isIos() && isInStandaloneMode()) {
      ym('reachGoal', 'standalone');
    }
  }
  render() {
    // console.log('App component rendered');
    return (
      <>
        {/* пришлось счетчик инициализировать в начале а не в конце, потому что иначе возникает ошибка при редиректе */}
        {process.env.NODE_ENV === 'production' && (
        <YMInitializer
          accounts={[50381566]}
          options={{
            clickmap: true,
            trackLinks: true,
            webvisor: true,
            params: {
              mode: isInStandaloneMode()
                ? isIos()
                  ? 'standalone_ios'
                  : 'standalone_android'
                : 'regular',
            },
          }}
          version="2"
        />
        )}
        <LocaleProvider locale={ru_RU}>
          <Router history={history}>
            <>
              <header>
                <Link to="/faculties" title="Изменить группу">
                  <Icon type="home" />
                </Link>
              </header>

              <div className="content-wrapper">
                <Switch>
                  <Route
                    path="/:facultyId(\d+)/:groupId(\d+)"
                    component={Schedule}
                  />
                  <Route path="/:facultyId(\d+)" component={ListGroups} />
                  <Route path="/faculties" component={ListFaculties} />
                  <Route
                    path="/"
                    render={(props: any) => {
                      const facultyId = localStorage['facultyId'];
                      const groupId = localStorage['groupId'];
                      const postfix =
                        props.location.search + props.location.hash;
                      if (facultyId && groupId)
                        return (
                          <Redirect to={`/${facultyId}/${groupId}${postfix}`} />
                        );
                      else return <Redirect to={'/faculties' + postfix} />;
                    }}
                  />
                </Switch>
              </div>

              <footer>
                Сделано с ❤{' '}
                <a
                  href="https://vk.com/savinyurii"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={event => {
                    ym('reachGoal', 'click_vk');
                  }}
                >
                  в Иркутске
                </a>
              </footer>
            </>
          </Router>
        </LocaleProvider>
      </>
    );
  }
}

// @TODO change any to appropriate types
history.listen((location: any, action: any) => {
  // console.log('location changed', location, action);
  ym('hit', location.pathname + location.search + location.hash);
});

export default App;
