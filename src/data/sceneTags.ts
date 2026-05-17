export interface TagItem { key: string; label: string; icon: string }

export const sceneTagMap: Record<string, TagItem[]> = {
  s1: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '介护食品', label: '介护食品', icon: '🍜' },
    { key: '营养补充', label: '营养补充', icon: '🥣' },
    { key: '增稠饮品', label: '增稠饮品', icon: '🧃' },
  ],
  s2: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '染发护发', label: '染发护发', icon: '💇' },
    { key: '按摩理疗', label: '按摩理疗', icon: '💆' },
    { key: '口腔护理', label: '口腔护理', icon: '🦷' },
    { key: '运动健身', label: '运动健身', icon: '🏋️' },
  ],
  s3: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '看护呼叫', label: '看护呼叫', icon: '🔔' },
    { key: '提醒', label: '提醒', icon: '⏰' },
  ],
  s4: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '养护床', label: '养护床', icon: '🛏️' },
    { key: '防褥疮垫', label: '防褥疮垫', icon: '🫧' },
    { key: '床边扶手', label: '床边扶手', icon: '🪜' },
  ],
  s5: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '放大镜', label: '放大镜', icon: '🔍' },
    { key: '滤蓝光眼镜', label: '滤蓝光眼镜', icon: '👓' },
  ],
  s6: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '洗澡椅', label: '洗澡椅', icon: '🪑' },
    { key: '扶手', label: '扶手', icon: '🦾' },
    { key: '如厕辅助', label: '如厕辅助', icon: '🚽' },
    { key: '无障碍', label: '无障碍', icon: '♿' },
    { key: '防滑', label: '防滑', icon: '🛑' },
  ],
  s7: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '散步车', label: '散步车', icon: '🚶' },
    { key: '拐杖', label: '拐杖', icon: '🩼' },
    { key: '轮椅', label: '轮椅', icon: '🦽' },
    { key: '止滑鞋', label: '止滑鞋', icon: '👟' },
    { key: '室内鞋', label: '室内鞋', icon: '👞' },
  ],
  s8: [
    { key: '全部', label: '全部', icon: '🎯' },
    { key: '助听器', label: '助听器', icon: '👂' },
    { key: '收音机', label: '收音机', icon: '📻' },
    { key: '通讯设备', label: '通讯设备', icon: '📱' },
  ],
}
