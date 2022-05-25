const mockUser = {
    client_email: 'user@gmail.com',
    password: '123456',
    firstName: 'test',
    isActive: '1'
  };
  
  const mockClass1 = {
    max_students: 1,
    subject: 'Math',
    status: 'open',
    from: '2023-02-28',
    to: '2023-05-25',
  };
  const mockClass2 = {
    max_students: 2,
    subject: 'Golang',
    status: 'pending',
    from: '2023-02-19',
    to: '2023-05-15',
  };
  const mockClass3 = {
    max_students: 4,
    subject: 'JS',
    status: 'open',
    from: '2023-05-28',
    to: '2023-08-25',
  };
  const mockClass4 = {
    max_students: 10,
    subject: 'RUBY',
    status: 'open',
    from: '2023-06-16',
    to: '2023-08-25',
  };
  const mockCalendar1 = {
    dayOfWeek: 'mon',
    openTime: '08:00',
    closeTime: '10:00',
  };
  
  const mockCalendar2 = {
    dayOfWeek: 'tue',
    openTime: '18:00',
    closeTime: '20:00',
  };
  
  module.exports = {
    mockUser,
    mockClass1,
    mockClass2,
    mockClass3,
    mockClass4,
    mockCalendar1,
    mockCalendar2,
  };
  