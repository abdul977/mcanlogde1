# MCAN Payment System - Admin Guide

## Overview

This guide covers the administrative functions of the MCAN Payment System, including payment verification, configuration, analytics, and troubleshooting.

## Admin Dashboard Access

### Login Requirements
- Admin role account
- Valid authentication credentials
- Access to admin dashboard

### Navigation
1. Log into admin panel
2. Navigate to "Payment Management" section
3. Access various payment-related modules

## Payment Verification Process

### Accessing Payment Verifications
1. Go to **Admin Dashboard** → **Payment Verification**
2. View list of pending payment proofs
3. Use filters to find specific payments

### Verification Workflow

#### Step 1: Review Payment Details
- **User Information**: Name, email, booking details
- **Payment Amount**: Verify against booking schedule
- **Payment Method**: Check method used
- **Transaction Reference**: Verify if provided
- **Payment Date**: Confirm timing
- **Uploaded Proof**: Examine screenshot/document

#### Step 2: Verify Payment Proof
**For Bank Transfers:**
- Check recipient account matches MCAN account
- Verify amount transferred
- Confirm transaction reference
- Check date and time
- Validate sender details

**For Mobile Money:**
- Verify recipient number
- Check amount sent
- Confirm transaction ID
- Validate date and time
- Check confirmation message

**For Cash Payments:**
- Verify official receipt
- Check receipt number in records
- Confirm amount and date
- Validate official stamp/signature

#### Step 3: Make Decision
**To Approve:**
1. Click "Approve" button
2. Add approval notes (optional)
3. Confirm action
4. System generates receipt automatically

**To Reject:**
1. Click "Reject" button
2. Add detailed rejection reason
3. Specify what needs correction
4. Confirm action
5. User receives notification with notes

**To Request Clarification:**
1. Click "Requires Clarification"
2. Specify what information is needed
3. User receives notification to provide additional details

### Best Practices for Verification

#### Quick Verification Checklist
- [ ] Amount matches payment schedule
- [ ] Payment method details are correct
- [ ] Transaction reference is valid
- [ ] Date is reasonable
- [ ] Proof document is clear and complete
- [ ] No signs of tampering or fraud

#### Red Flags to Watch For
- **Mismatched amounts**
- **Altered screenshots**
- **Wrong recipient details**
- **Suspicious transaction references**
- **Payments from unrelated accounts**
- **Poor quality or unclear images**

## Advanced Filtering and Search

### Basic Filters
- **Status**: Pending, Approved, Rejected, All
- **Date Range**: Filter by submission date
- **Search**: User name, accommodation, transaction reference

### Advanced Filters
- **Payment Method**: Bank transfer, mobile money, cash, card
- **Amount Range**: Set minimum and maximum amounts
- **Month Number**: Filter by payment month
- **Accommodation**: Filter by specific properties
- **User**: Filter by specific users

### Quick Filters
- **Today**: Payments submitted today
- **This Week**: Current week submissions
- **This Month**: Current month submissions
- **High Amount**: Payments above ₦100,000
- **Urgent**: Overdue or time-sensitive payments

### Sorting Options
- **Submission Date**: Newest/oldest first
- **Amount**: Highest/lowest first
- **Payment Date**: Recent/older payments
- **Month Number**: Sequential order

## Payment Configuration Management

### Accessing Payment Settings
1. Navigate to **Admin Dashboard** → **Payment Settings**
2. View current configuration
3. Make necessary updates

### Bank Account Configuration
```
Account Name: Muslim Corps Members Association of Nigeria
Account Number: [Enter account number]
Bank Name: [Enter bank name]
Sort Code: [If applicable]
Branch: [Branch information]
```

### Mobile Money Configuration
```
MTN Mobile Money:
- Number: [Enter MTN number]
- Account Name: [Account holder name]

Airtel Money:
- Number: [Enter Airtel number]
- Account Name: [Account holder name]

Other Providers:
- Add as needed
```

### Payment Instructions
- General payment guidelines
- Method-specific instructions
- Important notes for users
- Contact information

### Configuration Best Practices
1. **Regular Updates**: Keep account details current
2. **Clear Instructions**: Provide detailed payment steps
3. **Multiple Options**: Offer various payment methods
4. **Security**: Protect sensitive account information
5. **Testing**: Verify all payment methods work

## Analytics and Reporting

### Payment Overview Dashboard
- **Total Payments**: All-time payment count
- **Pending Verifications**: Awaiting review
- **Monthly Revenue**: Current month earnings
- **Approval Rate**: Percentage of approved payments
- **Average Processing Time**: Time to verify payments

### Detailed Analytics
- **Payment Trends**: Daily, weekly, monthly patterns
- **Method Distribution**: Popular payment methods
- **User Activity**: Most active users
- **Accommodation Performance**: Revenue by property
- **Geographic Distribution**: Payments by location

### Custom Reports
1. **Date Range Reports**: Specific time periods
2. **User Reports**: Individual user payment history
3. **Accommodation Reports**: Property-specific data
4. **Method Reports**: Payment method analysis
5. **Status Reports**: Approval/rejection analysis

### Export Options
**Excel Export:**
- Comprehensive data with charts
- Multiple worksheets
- Summary statistics
- Formatted for analysis

**CSV Export:**
- Raw data format
- Easy import to other systems
- Customizable fields
- Bulk data processing

## Audit Trail and Security

### Audit Log Features
- **Action Tracking**: All admin actions logged
- **User Activity**: Complete user interaction history
- **System Events**: Automated system actions
- **Security Events**: Login attempts, access violations

### Viewing Audit Trails
1. Navigate to **Payment Verification** → **Audit Trail**
2. Select payment to view history
3. Filter by action type or date
4. Export audit data if needed

### Security Monitoring
- **Failed Login Attempts**: Monitor unauthorized access
- **Suspicious Activity**: Unusual payment patterns
- **Data Access**: Track who accessed what data
- **System Changes**: Configuration modifications

## Notification Management

### Admin Notifications
- **New Payment Submissions**: Immediate alerts
- **Overdue Payments**: Daily summaries
- **System Issues**: Technical problems
- **Security Alerts**: Suspicious activities

### User Notifications
- **Payment Confirmations**: Approval/rejection notices
- **Payment Reminders**: Due date alerts
- **Receipt Generation**: Automatic receipt delivery
- **System Updates**: Important announcements

### Notification Settings
1. **Email Preferences**: Configure admin email alerts
2. **SMS Settings**: Set up text message notifications
3. **Dashboard Alerts**: In-app notification preferences
4. **Frequency Settings**: How often to receive updates

## Troubleshooting Common Issues

### Payment Verification Issues

**Problem**: Payment proof is unclear
**Solution**: 
- Request clearer image from user
- Use "Requires Clarification" status
- Provide specific instructions

**Problem**: Transaction reference doesn't match
**Solution**:
- Check with bank/mobile money provider
- Verify user provided correct reference
- Cross-reference with bank statements

**Problem**: Amount discrepancy
**Solution**:
- Check payment schedule
- Verify any discounts applied
- Contact user for clarification

### System Issues

**Problem**: Slow loading times
**Solutions**:
- Use filters to reduce data load
- Clear browser cache
- Check server performance
- Contact technical support

**Problem**: Export function not working
**Solutions**:
- Check browser popup settings
- Verify file permissions
- Try different export format
- Contact technical support

**Problem**: Notifications not sending
**Solutions**:
- Check email service status
- Verify user email addresses
- Check spam filters
- Review notification settings

### User Support Issues

**Problem**: User can't upload payment proof
**Solutions**:
- Check file size and format requirements
- Verify browser compatibility
- Test upload functionality
- Provide alternative submission method

**Problem**: User disputes rejection
**Solutions**:
- Review rejection reason
- Re-examine payment proof
- Discuss with user directly
- Escalate if necessary

## Performance Optimization

### Daily Tasks
- [ ] Review pending payments
- [ ] Process urgent verifications
- [ ] Check system notifications
- [ ] Monitor dashboard metrics

### Weekly Tasks
- [ ] Generate weekly reports
- [ ] Review audit logs
- [ ] Update payment configurations
- [ ] Analyze payment trends

### Monthly Tasks
- [ ] Comprehensive analytics review
- [ ] Export monthly data
- [ ] Update documentation
- [ ] Review and optimize processes

## Emergency Procedures

### System Downtime
1. **Immediate Actions**:
   - Notify technical team
   - Inform users of downtime
   - Document issues encountered
   - Implement backup procedures

2. **Communication**:
   - Send system status updates
   - Provide alternative contact methods
   - Set expectations for resolution

### Data Issues
1. **Data Loss Prevention**:
   - Regular backups
   - Version control
   - Audit trail maintenance
   - Recovery procedures

2. **Data Recovery**:
   - Contact technical support
   - Restore from backups
   - Verify data integrity
   - Communicate with affected users

### Security Incidents
1. **Immediate Response**:
   - Secure affected systems
   - Document incident details
   - Notify security team
   - Preserve evidence

2. **Investigation**:
   - Review audit logs
   - Identify breach scope
   - Implement fixes
   - Update security measures

## Contact Information

### Technical Support
- **Email**: tech-support@mcan.org
- **Phone**: +234-XXX-XXX-XXXX
- **Emergency**: +234-XXX-XXX-XXXX

### Payment Support
- **Email**: payments@mcan.org
- **Phone**: +234-XXX-XXX-XXXX

### System Administration
- **Email**: admin@mcan.org
- **Phone**: +234-XXX-XXX-XXXX

---

**Remember**: Always maintain confidentiality of user data and follow established procedures for all payment-related activities.

*Last updated: [Current Date]*
