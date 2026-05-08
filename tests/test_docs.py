import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def no_duplicate_object_pairs(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key: {key}")
        result[key] = value
    return result


class DocsTests(unittest.TestCase):
    def test_readme_example_uses_current_cli_schema(self) -> None:
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        match = re.search(r"示例结构：\n\n```json\n(.*?)\n```", readme, re.S)
        self.assertIsNotNone(match)
        example = json.loads(match.group(1), object_pairs_hook=no_duplicate_object_pairs)
        self.assert_current_schema_example(example)

        self.assertIn("公开 `#data` 链接和短链接使用压缩后的 public payload", readme)
        self.assertIn("不包含原始日志、本地路径、源码片段、session id 或提示词长文本", readme)

    def test_output_schema_reference_uses_current_cli_schema(self) -> None:
        schema = (ROOT / "skill" / "references" / "output-schema.md").read_text(encoding="utf-8")
        match = re.search(r"## JSON 字段\n\n```json\n(.*?)\n```", schema, re.S)
        self.assertIsNotNone(match)
        example = json.loads(match.group(1), object_pairs_hook=no_duplicate_object_pairs)
        self.assert_current_schema_example(example)

    def assert_current_schema_example(self, example: dict) -> None:
        self.assertIsInstance(example["rank"], dict)
        self.assertEqual(example["rank"]["label"], "六品 · 已有大成")
        self.assertIn("judgmentMode", example)
        self.assertIn("isFinal", example)
        self.assertIn("usageStats", example)
        self.assertIn("hardStats", example)
        self.assertIn("metricGroups", example)
        self.assertIn("statProfile", example)
        self.assertIn("dimensionProfile", example)
        self.assertIn("rankCaps", example)
        self.assertIn("unlockStatus", example)
        self.assertEqual(example["metricGroups"][0]["id"], "investment")
        self.assertIn("ratingImpact", example["metricGroups"][0])
        self.assertIn("risk", example["metricGroups"][0])
        self.assertEqual(example["statProfile"]["id"], "system_owner")
        self.assertIn("ratingUse", example["statProfile"])
        self.assertIn("reasons", example["statProfile"])
        self.assertIn("matchedRules", example["statProfile"])
        self.assertNotIn("judgment_mode", example)
        self.assertNotIn("is_final", example)
        self.assertNotIn("usage_stats", example)
        self.assertNotIn("hard_stats", example)
        self.assertNotIn("dimension_profile", example)
        self.assertNotIn("rank_caps", example)
        self.assertNotIn("unlock_status", example)


if __name__ == "__main__":
    unittest.main()
