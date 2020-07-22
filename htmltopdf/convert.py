import os
import sqlite3
import time


while(True):
	conn = sqlite3.connect('files')
	c = conn.cursor()


	for row in c.execute('SELECT * FROM files WHERE status = 0'):
		#print(row)
		os.system('wkhtmltopdf ' + 'UploadedFiles/' + row[1] + " " + 'OutPDFs/' + row[1] + ".pdf")
		c.execute('UPDATE files SET status = 1 WHERE status = 0')
		
	for row in c.execute('SELECT * FROM files WHERE status = 2'):
		c.execute('DELETE FROM files where status = 2')
		os.remove('UploadedFiles/' + row[1])
		os.remove('OutPDFs/' + row[1] + ".pdf")

	conn.commit()
	conn.close()
	time.sleep(2)