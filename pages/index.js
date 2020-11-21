import { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import Page from '../components/Page';
// import { addCount } from '../redux/actions/countActions';
import { wrapper } from '../redux/store';
// import { serverRenderClock, startClock } from '../redux/actions/tickActions';

const Index = (props) => {
  return <h1>Hello World!</h1>
  // return <Page title="Index Page" linkTo="/other" />
}

export const getStaticProps = wrapper.getStaticProps(async ({ store }) => {
  // store.dispatch(serverRenderClock(true))
  // store.dispatch(addCount())
})

const mapDispatchToProps = (dispatch) => {
  return {
    // addCount: bindActionCreators(addCount, dispatch),
    // startClock: bindActionCreators(startClock, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(Index)