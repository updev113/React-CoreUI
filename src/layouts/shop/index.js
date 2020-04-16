import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import * as router from 'react-router-dom'
import { connect } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { bindActionCreators } from 'redux'

import { Container, Nav, NavItem, Label, Card } from 'reactstrap'
import { AppHeader, AppFooter } from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'

import { shopRoutes } from 'routes'
import { AuthActions, CommonActions } from 'services/global'
import { ThemeProvider } from 'styled-components'
import { darkTheme, lightTheme } from 'layouts/theme/theme'
import { GlobalStyles } from 'layouts/theme/global'

import { Loading } from 'components'

import Header from './header'

import './style.scss'

const mapStateToProps = (state) => {
	return {
		version: state.common.version,
		user: state.common.general_info,
		profile: state.auth.profile,
		is_authed: state.auth.is_authed
	}
}
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch)
	}
}

class ShopLayout extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			theme: window.localStorage.getItem('theme') || 'light'
		}
	}

	componentDidMount() {
		this.props.authActions.getSelfUser().catch((err) => {
			this.props.authActions.logOut()
		})
		this.props.commonActions
			.getGeneralUserInfo(this.props.match.params.username)
			.catch((e) => {
				if (e.status == 404) {
					if (window.location.pathname !== '/404') {
						window.location = '/404'
					}
				}
			})
		const toastifyAlert = (status, message) => {
			if (!message) {
				message = 'Unexpected Error'
			}
			if (status === 'success') {
				toast.success(message, {
					position: toast.POSITION.TOP_RIGHT
				})
			} else if (status === 'error') {
				toast.error(message, {
					position: toast.POSITION.TOP_RIGHT
				})
			} else if (status === 'warn') {
				toast.warn(message, {
					position: toast.POSITION.TOP_RIGHT
				})
			} else if (status === 'info') {
				toast.info(message, {
					position: toast.POSITION.TOP_RIGHT
				})
			}
		}
		this.props.commonActions.setTostifyAlertFunc(toastifyAlert)
		// }
	}

	changeTheme() {
		const theme = window.localStorage.getItem('theme') || 'light'
		window.localStorage.setItem('theme', theme === 'light' ? 'dark' : 'light')

		this.setState({ theme: theme === 'light' ? 'dark' : 'light' })
	}

	render() {
		const containerStyle = {
			zIndex: 1999
		}

		const pathname = this.props.history.location.pathname

		const { user } = this.props
		const userId = this.props.match.params.username

		const theme =
			window.localStorage.getItem('theme') || this.state.theme || 'light'

		return (
			<ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
				<GlobalStyles />
				<div className={'shop-container'}>
					<div className="app">
						<AppHeader>
							<Suspense fallback={Loading()}>
								<Header
									{...this.props}
									theme={theme}
									changeTheme={this.changeTheme.bind(this)}
								/>
							</Suspense>
						</AppHeader>

						<div className="shop-content flex-column">
							<section className="pb-3">
								<div className="text-center align-items-center logo-content">
									<h4 className="mb-0 mt-3 mb-3">{user.username}</h4>
									{user.profile_attachment ? (
										<img
											src={user.profile_attachment}
											width="130"
											height="130"
											style={{ borderRadius: '50%' }}
										/>
									) : (
										<i
											className="fa fa-user-circle text-primary avatar-icon"
											style={{ fontSize: 130 }}
										/>
									)}
								</div>
								<Card
									className="report-count mb-3 mt-3 ml-auto mr-auto pt-1 pb-1 pl-3 pr-3 flex-row"
									style={{ width: 'fit-content' }}
								>
									<span className="text-green mr-2">
										{user.feedback ? user.feedback.positive : 0}
									</span>
									<span className="" />
									<span className="text-grey pl-2 pr-2">
										{user.feedback ? user.feedback.neutral : 0}
									</span>
									<span className="" />
									<span className="text-red ml-2">
										{user.feedback ? user.feedback.negative : 0}
									</span>
								</Card>
								<div className="shop-navs">
									<Nav className="d-flex flex-row justify-content-center">
										<NavItem
											className="px-3"
											active={
												pathname == `/${userId}` ||
												pathname.includes(`/${userId}/category`)
											}
										>
											<NavLink to={`/${userId}`} className="nav-link">
												Products
											</NavLink>
										</NavItem>
										<NavItem
											className="px-3"
											active={pathname == `/${userId}/contact`}
										>
											<NavLink to={`/${userId}/contact`} className="nav-link">
												Contact
											</NavLink>
										</NavItem>
										<NavItem
											className="px-3"
											active={pathname == `/${userId}/feedback`}
										>
											<NavLink to={`/${userId}/feedback`} className="nav-link">
												Feedback
											</NavLink>
										</NavItem>
									</Nav>
								</div>
							</section>

							<div className="shop-section">
								<div className="shop-main p-3">
									<Container className="p-0" fluid>
										<Suspense fallback={Loading()}>
											<ToastContainer
												position="top-right"
												autoClose={5000}
												style={containerStyle}
											/>
											<Switch>
												{shopRoutes.map((prop, key) => {
													if (prop.redirect)
														return (
															<Redirect
																from={prop.path}
																to={prop.pathTo}
																key={key}
															/>
														)
													return (
														<Route
															path={prop.path}
															component={prop.component}
															key={key}
															exact={true}
														/>
													)
												})}
											</Switch>
										</Suspense>
									</Container>
								</div>
							</div>
						</div>

						<AppFooter>
							<p className="text-center text-grey footer-report py-4 m-0">
								Copyright by Sellix.io -{' '}
								<a href="mailto:abuse@sellix.io">Report Abuse</a>
							</p>
						</AppFooter>
					</div>
				</div>
			</ThemeProvider>
		)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopLayout)
