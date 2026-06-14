import type { Message } from '../types'

interface Props {
  message: Message
}

export function MessageViewer({ message }: Props) {
  return (
    <div className="space-y-4">
      {/* Message header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
        <h2 className="text-lg font-medium text-white">{message.subject || '(no subject)'}</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
          <span>
            <span className="text-gray-600">From:</span> {message.from}
          </span>
          <span>
            <span className="text-gray-600">Date:</span> {message.date}
          </span>
        </div>
      </div>

      {/* Message body */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 min-h-[200px]">
        {message.htmlBody ? (
          <iframe
            srcDoc={message.htmlBody}
            className="w-full min-h-[400px] bg-white rounded-lg"
            sandbox=""
            title="Email content"
          />
        ) : message.textBody ? (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
            {message.textBody}
          </pre>
        ) : message.body ? (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
            {message.body}
          </pre>
        ) : (
          <p className="text-gray-600 text-center py-8">No message body</p>
        )}
      </div>
    </div>
  )
}
