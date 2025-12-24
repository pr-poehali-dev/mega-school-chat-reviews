import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление отзывами: получение, добавление, удаление (для админа)
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Code',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute(
                "SELECT id, nickname, rating, text, created_at FROM reviews WHERE is_visible = true ORDER BY created_at DESC"
            )
            rows = cur.fetchall()
            reviews = []
            for row in rows:
                reviews.append({
                    'id': str(row[0]),
                    'nickname': row[1],
                    'rating': row[2],
                    'text': row[3],
                    'date': row[4].strftime('%Y-%m-%d')
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(reviews),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            admin_code = event.get('headers', {}).get('x-admin-code') or event.get('headers', {}).get('X-Admin-Code')
            
            if admin_code == 'stepan12':
                action = body_data.get('action')
                if action == 'get_all':
                    cur.execute(
                        "SELECT id, nickname, rating, text, created_at, is_visible FROM reviews ORDER BY created_at DESC"
                    )
                    rows = cur.fetchall()
                    reviews = []
                    for row in rows:
                        reviews.append({
                            'id': str(row[0]),
                            'nickname': row[1],
                            'rating': row[2],
                            'text': row[3],
                            'date': row[4].strftime('%Y-%m-%d'),
                            'is_visible': row[5]
                        })
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(reviews),
                        'isBase64Encoded': False
                    }
                elif action == 'toggle_visibility':
                    review_id = body_data.get('review_id')
                    cur.execute(
                        "UPDATE reviews SET is_visible = NOT is_visible WHERE id = %s RETURNING is_visible",
                        (review_id,)
                    )
                    result = cur.fetchone()
                    conn.commit()
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'is_visible': result[0] if result else False}),
                        'isBase64Encoded': False
                    }
            
            nickname = body_data.get('nickname', '').strip()
            rating = body_data.get('rating', 5)
            text = body_data.get('text', '').strip()
            
            if not nickname or not text:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Nickname and text are required'}),
                    'isBase64Encoded': False
                }
            
            if rating < 1 or rating > 5:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Rating must be between 1 and 5'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO reviews (nickname, rating, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                (nickname, rating, text)
            )
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'id': str(result[0]),
                    'nickname': nickname,
                    'rating': rating,
                    'text': text,
                    'date': result[1].strftime('%Y-%m-%d')
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            admin_code = event.get('headers', {}).get('x-admin-code') or event.get('headers', {}).get('X-Admin-Code')
            if admin_code != 'stepan12':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Forbidden'}),
                    'isBase64Encoded': False
                }
            
            params = event.get('queryStringParameters', {})
            review_id = params.get('id')
            
            if not review_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Review ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM reviews WHERE id = %s", (review_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
