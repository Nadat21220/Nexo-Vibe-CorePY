import pg8000.dbapi as psycopg2
try:
    conn = psycopg2.connect(
        host="localhost",
        port=30805,
        database="nexovibe_bd",
        user="postgres",
        password="dAG172005%"
    )
    print("Success:", conn)
except Exception as e:
    print("Error:", str(e))
