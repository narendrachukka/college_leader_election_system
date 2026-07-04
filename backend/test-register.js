async function run() {
  try {
    const res = await fetch('http://localhost:5001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        rollNumber: 'RTEST1234',
        email: 'teststudent@example.com',
        phone: '9999999999',
        department: 'Computer Science',
        year: '3',
        password: 'Password123!',
        role: 'Voter'
      })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  } catch (err) {
    console.error('ERR', err.message || err);
  }
}

run();
